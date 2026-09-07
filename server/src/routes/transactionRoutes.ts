import express from "express";
import {
  createStripePaymentIntent,
  createTransaction,
  listTransactions,
  createFreeTransaction,
  listByIdTransactions,
} from "../controllers/transactionController";

const router = express.Router();

router.get("/", listTransactions);
router.post("/", createTransaction);
router.post("/free", createFreeTransaction);
router.post("/stripe/payment-intent", createStripePaymentIntent);
router.get("/byid", listByIdTransactions);

export default router;
