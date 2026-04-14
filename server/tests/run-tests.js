import assert from "node:assert/strict";
import { optimizationService } from "../src/services/optimizationService.js";
import { validate } from "../src/middleware/validationMiddleware.js";
import { paymentGatewayService } from "../src/services/paymentGatewayService.js";

const tests = [
  {
    name: "optimizationService packs pieces and returns board metrics",
    run: () => {
      const result = optimizationService.optimize({
        boardWidth: 2750,
        boardHeight: 1830,
        pieces: [
          { name: "Panel A", width: 900, height: 560, quantity: 2, grainDirection: "flexible" },
          { name: "Panel B", width: 560, height: 720, quantity: 2, grainDirection: "fixed" }
        ]
      });

      assert.equal(result.boardCount >= 1, true);
      assert.equal(Array.isArray(result.boards), true);
      assert.equal(typeof result.totalWastePercentage, "number");
      assert.equal(result.boards[0].placements.length > 0, true);
    }
  },
  {
    name: "paymentGatewayService simulated provider approves test card ending in 42",
    run: async () => {
      const result = await paymentGatewayService.charge({
        amount: 1200,
        method: "card",
        cardNumber: "4000000000000042",
        cardHolderName: "Test User"
      });

      assert.equal(result.status, "paid");
      assert.equal(result.provider, "simulated");
      assert.equal(Boolean(result.referenceCode), true);
    }
  },
  {
    name: "validation middleware rejects invalid payloads",
    run: async () => {
      const middleware = validate({
        body: {
          quantity: { required: true, type: "integer", min: 1 }
        }
      });

      const req = { body: { quantity: 0 }, params: {}, query: {} };
      let capturedError = null;

      await middleware(req, {}, (error) => {
        capturedError = error;
      });

      assert.equal(Boolean(capturedError), true);
      assert.equal(capturedError.statusCode, 400);
    }
  }
];

let passed = 0;

for (const entry of tests) {
  try {
    await entry.run();
    passed += 1;
    console.log(`PASS ${entry.name}`);
  } catch (error) {
    console.error(`FAIL ${entry.name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  console.log(`All ${passed} tests passed.`);
}
