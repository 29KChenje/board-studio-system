import { optimizationService } from "../services/optimizationService.js";
import { pricingService } from "../services/pricingService.js";

export const optimizationController = {
  optimize: async (req, res) => {
    const optimization = optimizationService.optimize(req.body);
    const quote = pricingService.buildQuote({
      pieces: req.body.pieces,
      optimization
    });

    res.json({
      optimization,
      quote
    });
  }
};
