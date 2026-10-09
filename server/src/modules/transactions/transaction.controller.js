import { transactionService } from "./transaction.service.js";
import { ApiResponse } from "../../shared/ApiResponse.js";

export const transactionController = {
  create: async (req, res) => {
    const transaction = await transactionService.create(
      req.user._id,
      req.body,
      req.user,
    );
    ApiResponse.created(res, transaction, "Transaction initiated");
  },

  getMy: async (req, res) => {
    const result = await transactionService.getMyTransactions(
      req.user._id,
      req.query,
      req.user,
    );
    ApiResponse.paginated(res, result.transactions, result.pagination);
  },

  getById: async (req, res) => {
    const transaction = await transactionService.getById(
      req.params.id,
      req.user._id,
      req.user,
    );
    ApiResponse.success(res, transaction);
  },

  updateStatus: async (req, res) => {
    const transaction = await transactionService.updateStatus(
      req.params.id,
      req.body,
      req.user,
    );
    ApiResponse.success(res, transaction, "Transaction status updated");
  },
};
