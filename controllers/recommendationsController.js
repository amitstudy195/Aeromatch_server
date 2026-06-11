const Car = require('../models/Car');

const calculateMedian = (arr) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

exports.getRecommendations = async (req, res) => {
  try {
    const { budget, primaryUse, mustHave } = req.body;

    if (budget === undefined || !primaryUse || !mustHave) {
      return res.status(400).json({ error: 'Please provide all required parameters: budget, primaryUse, and mustHave.' });
    }

    const numericBudget = Number(budget);
    if (isNaN(numericBudget) || numericBudget <= 0) {
      return res.status(400).json({ error: 'Budget must be a positive number.' });
    }

    const allCars = await Car.find({});
    if (allCars.length === 0) {
      return res.status(404).json({ error: 'No cars found in the database. Please run the seed script first.' });
    }

    const medians = {
      price: calculateMedian(allCars.map(c => c.price)),
      mileage: calculateMedian(allCars.map(c => c.mileage)),
      safetyRating: calculateMedian(allCars.map(c => c.safetyRating))
    };

    const budgetCeiling = numericBudget * 1.1;
    const withinBudgetCars = allCars.filter(car => car.price <= budgetCeiling);

    if (withinBudgetCars.length === 0) {
      return res.status(404).json({
        error: `No cars found within 10% of your $${numericBudget.toLocaleString()} budget. Try increasing your budget.`,
        medians
      });
    }

    const scoredCars = withinBudgetCars.map(car => {
      let score = 100;
      const scoreBreakdown = {
        base: 100,
        useCaseBonus: 0,
        useCasePenalty: 0,
        mustHaveBonus: 0,
        mustHavePenalty: 0,
        budgetAlignmentBonus: 0,
        budgetAlignmentPenalty: 0,
        reviewPenalty: 0
      };

      if (primaryUse === 'family_hauler') {
        if (car.specs.seating >= 5) {
          scoreBreakdown.useCaseBonus += 25;
        } else {
          scoreBreakdown.useCasePenalty -= 35;
        }
        if (car.safetyRating >= 4) {
          scoreBreakdown.useCaseBonus += 15;
        } else {
          scoreBreakdown.useCasePenalty -= 25;
        }
        if (car.specs.trunkSpace < 15) {
          scoreBreakdown.useCasePenalty -= 20;
        }
      } else if (primaryUse === 'city_commute') {
        if (car.mileage >= 30) {
          scoreBreakdown.useCaseBonus += 30;
        } else if (car.mileage >= 25) {
          scoreBreakdown.useCaseBonus += 15;
        }
        if (car.mileage < 22) {
          scoreBreakdown.useCasePenalty -= 25;
        }
        if (car.specs.trunkSpace < 12) {
          scoreBreakdown.useCaseBonus += 5;
        }
      } else if (primaryUse === 'road_trips') {
        if (car.mileage >= 26) {
          scoreBreakdown.useCaseBonus += 15;
        }
        if (car.specs.seating >= 5) {
          scoreBreakdown.useCaseBonus += 10;
        }
        if (car.specs.trunkSpace >= 25) {
          scoreBreakdown.useCaseBonus += 20;
        } else if (car.specs.trunkSpace < 15) {
          scoreBreakdown.useCasePenalty -= 20;
        }
      } else if (primaryUse === 'weekend_adventure') {
        if (car.specs.drivetrain === 'AWD' || car.specs.drivetrain === '4WD') {
          scoreBreakdown.useCaseBonus += 30;
        } else {
          scoreBreakdown.useCasePenalty -= 20;
        }
        if (car.specs.trunkSpace >= 25) {
          scoreBreakdown.useCaseBonus += 15;
        }
      }

      if (mustHave === 'safety') {
        scoreBreakdown.mustHaveBonus += car.safetyRating * 15;
        if (car.safetyRating <= 3) {
          scoreBreakdown.mustHavePenalty -= 40;
        }
      } else if (mustHave === 'fuel_efficiency') {
        scoreBreakdown.mustHaveBonus += Math.round(car.mileage * 1.2);
        if (car.mileage < 25) {
          scoreBreakdown.mustHavePenalty -= 35;
        }
      } else if (mustHave === 'cargo_space') {
        scoreBreakdown.mustHaveBonus += Math.round(car.specs.trunkSpace * 1.5);
        if (car.specs.trunkSpace < 18) {
          scoreBreakdown.mustHavePenalty -= 35;
        }
      } else if (mustHave === 'low_cost') {
        if (car.price <= numericBudget) {
          const savingsRatio = (numericBudget - car.price) / numericBudget;
          scoreBreakdown.mustHaveBonus += Math.round(savingsRatio * 40);
        } else {
          scoreBreakdown.mustHavePenalty -= 20;
        }
      }

      // Budget Class Alignment Scoring (ensure recommendations match target price segment)
      if (mustHave !== 'low_cost') {
        const lowerClassLimit = numericBudget * 0.75;
        const upperClassLimit = numericBudget * 1.05;
        const extremeFloorLimit = numericBudget * 0.65;

        if (car.price >= lowerClassLimit && car.price <= upperClassLimit) {
          scoreBreakdown.budgetAlignmentBonus += 30;
        } else if (car.price < extremeFloorLimit) {
          // Penalize cars that are way too cheap for this buyer segment
          scoreBreakdown.budgetAlignmentPenalty -= 40;
        }

        // Apply a small stretch penalty if the price exceeds the budget limit (but within 10% tolerance)
        if (car.price > numericBudget) {
          scoreBreakdown.budgetAlignmentPenalty -= 15;
        }
      }

      const keywords = {
        safety: ["unsafe", "unreliable", "dangerous", "hazard", "recalled", "broke down", "faulty", "flimsy", "accident"],
        fuel_efficiency: ["gas guzzler", "thirsty", "poor mileage", "bad mpg", "expensive to fuel", "fuel hog"],
        cargo_space: ["cramped", "small trunk", "tight", "no room", "limited space", "cannot fit"],
        low_cost: ["expensive to maintain", "overpriced", "maintenance cost", "high maintenance", "pricey parts", "costly"]
      };

      const targetKeywords = keywords[mustHave] || [];
      car.userReviews.forEach(review => {
        const lowerReview = review.toLowerCase();
        targetKeywords.forEach(kw => {
          if (lowerReview.includes(kw)) {
            scoreBreakdown.reviewPenalty -= 15;
          }
        });
      });

      score += (
        scoreBreakdown.useCaseBonus + 
        scoreBreakdown.useCasePenalty + 
        scoreBreakdown.mustHaveBonus + 
        scoreBreakdown.mustHavePenalty + 
        scoreBreakdown.budgetAlignmentBonus + 
        scoreBreakdown.budgetAlignmentPenalty + 
        scoreBreakdown.reviewPenalty
      );

      return {
        car,
        score,
        scoreBreakdown
      };
    });

    scoredCars.sort((a, b) => b.score - a.score);

    const topScored = scoredCars.slice(0, 3);
    const top3Ids = new Set(topScored.map(item => item.car._id.toString()));

    const recommendations = topScored.map(item => {
      const { car, score } = item;
      const matchPercentage = Math.round(Math.min(99, Math.max(60, 60 + ((score - 50) / 150) * 39)));

      let explanation = "";
      if (mustHave === 'safety') {
        explanation = `This ${car.make} is a superb fit because of its pristine ${car.safetyRating}-star safety credentials. Owners routinely praise its robust cabin structure and stability, matching your focus on passenger protection.`;
      } else if (mustHave === 'fuel_efficiency') {
        explanation = `Providing a massive relief at the pump, this ${car.model} delivers an exceptional ${car.mileage} MPG. It translates to highly cost-efficient travel, aligning perfectly with your mileage objectives.`;
      } else if (mustHave === 'cargo_space') {
        explanation = `With ${car.specs.trunkSpace} cu. ft. of trunk space, this ${car.model} eliminates space limitations. It provides the heavy-duty storage capability needed for all your transport needs.`;
      } else {
        explanation = `Offered at $${car.price.toLocaleString()}, this ${car.model} lets you purchase well within your budget limit of $${numericBudget.toLocaleString()}. It is highly budget-friendly, securing maximum value for your money.`;
      }

      if (primaryUse === 'family_hauler') {
        explanation += ` Additionally, the ${car.specs.seating}-seat cabin ensures your family journeys are comfortable.`;
      } else if (primaryUse === 'weekend_adventure') {
        explanation += ` Equipped with an ${car.specs.drivetrain} setup, it handles rugged weekend getaways with confidence.`;
      } else if (primaryUse === 'city_commute') {
        explanation += ` Its compact and responsive footprint is optimized for navigating tight urban commutes.`;
      } else if (primaryUse === 'road_trips') {
        explanation += ` Features such as highway efficiency and ergonomic seating make it perfect for long drives.`;
      }

      let tradeOff = "";
      if (car.specs.trunkSpace < 16) {
        tradeOff = "Trunk capacity is tighter than similar SUV alternatives, limiting larger item transport.";
      } else if (car.mileage < 23) {
        tradeOff = "Higher fuel consumption rates will mean more frequent stops at the gas station.";
      } else if (car.safetyRating < 4) {
        tradeOff = "Features a lower crash rating and fewer active safety monitors than competitors.";
      } else if (car.price > numericBudget) {
        tradeOff = `Slightly stretches your target budget threshold by $${(car.price - numericBudget).toLocaleString()}.`;
      } else if (car.specs.seating < 5) {
        tradeOff = "Only seats 4, which could restrict your flexibility for larger family groups.";
      } else if (item.scoreBreakdown.reviewPenalty < 0) {
        tradeOff = "A few owner reports mention minor cabin rattles or elevated maintenance costs.";
      } else {
        tradeOff = "Offers a solid overall balance, though lacks high-end aesthetic or premium interior styling.";
      }

      const positiveReview = car.userReviews.find(r => 
        r.toLowerCase().includes('great') || 
        r.toLowerCase().includes('excellent') || 
        r.toLowerCase().includes('super') || 
        r.toLowerCase().includes('amazing') || 
        r.toLowerCase().includes('best') || 
        r.toLowerCase().includes('reliable') ||
        r.toLowerCase().includes('smooth') ||
        r.toLowerCase().includes('love')
      ) || car.userReviews[0] || "No positive comments summarized.";

      const negativeReview = car.userReviews.find(r => 
        r.toLowerCase().includes('but') || 
        r.toLowerCase().includes('noise') || 
        r.toLowerCase().includes('small') || 
        r.toLowerCase().includes('cramped') || 
        r.toLowerCase().includes('guzzler') || 
        r.toLowerCase().includes('expensive') || 
        r.toLowerCase().includes('unsafe') || 
        r.toLowerCase().includes('poor') ||
        r.toLowerCase().includes('sluggish') ||
        r.toLowerCase().includes('confusing') ||
        r.toLowerCase().includes('high') ||
        r.toLowerCase().includes('repair') ||
        r.toLowerCase().includes('heavy') ||
        r.toLowerCase().includes('tight')
      ) || car.userReviews[car.userReviews.length - 1] || "No critical comments summarized.";

      return {
        _id: car._id,
        make: car.make,
        model: car.model,
        variant: car.variant,
        price: car.price,
        mileage: car.mileage,
        safetyRating: car.safetyRating,
        specs: car.specs,
        matchPercentage,
        explanation,
        tradeOff,
        reviewsSummary: {
          positive: positiveReview,
          negative: negativeReview
        }
      };
    });

    const remainingScored = scoredCars.filter(item => !top3Ids.has(item.car._id.toString()));
    let radicalCuller = null;

    for (const item of remainingScored) {
      const car = item.car;
      let cullReason = "";

      if (mustHave === 'safety' && car.safetyRating <= 3) {
        cullReason = `Why you don't see the ${car.make} ${car.model}: It fit your budget perfectly, but had a ${car.safetyRating}-star safety rating which violated your safety preference.`;
      } else if (mustHave === 'fuel_efficiency' && car.mileage < 25) {
        cullReason = `Why you don't see the ${car.make} ${car.model}: It fit your budget perfectly, but its low efficiency of ${car.mileage} MPG violated your fuel efficiency preference.`;
      } else if (mustHave === 'cargo_space' && car.specs.trunkSpace < 18) {
        cullReason = `Why you don't see the ${car.make} ${car.model}: It fit your budget perfectly, but its small trunk space of ${car.specs.trunkSpace} cu. ft. violated your storage preference.`;
      } else if (primaryUse === 'family_hauler' && car.specs.seating < 5) {
        cullReason = `Why you don't see the ${car.make} ${car.model}: It fit your budget, but its limited capacity of ${car.specs.seating} seats failed your family hauling requirements.`;
      } else if (primaryUse === 'weekend_adventure' && car.specs.drivetrain !== 'AWD' && car.specs.drivetrain !== '4WD') {
        cullReason = `Why you don't see the ${car.make} ${car.model}: It fit your budget, but its ${car.specs.drivetrain} drivetrain was deemed unsuitable for rugged outdoor terrain.`;
      }

      if (cullReason) {
        radicalCuller = {
          make: car.make,
          model: car.model,
          variant: car.variant,
          price: car.price,
          mileage: car.mileage,
          safetyRating: car.safetyRating,
          cullReason
        };
        break;
      }
    }

    if (!radicalCuller && remainingScored.length > 0) {
      const worst = remainingScored[remainingScored.length - 1].car;
      radicalCuller = {
        make: worst.make,
        model: worst.model,
        variant: worst.variant,
        price: worst.price,
        mileage: worst.mileage,
        safetyRating: worst.safetyRating,
        cullReason: `Why you don't see the ${worst.make} ${worst.model}: While it fits your budget of $${numericBudget.toLocaleString()}, its spec sheet and owner reviews didn't align closely enough with your need for ${mustHave.replace('_', ' ')}.`
      };
    }

    res.json({
      recommendations,
      radicalCuller,
      medians
    });

  } catch (error) {
    console.error('Error calculating recommendations:', error);
    res.status(500).json({ error: 'An internal error occurred while processing recommendations.' });
  }
};
