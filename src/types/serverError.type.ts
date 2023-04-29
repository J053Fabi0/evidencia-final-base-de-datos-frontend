import { AxiosError, isAxiosError } from "axios";

// "error": {
//     "description": "Validation error: 'id' length must be 24 characters long",
//     "details": [
//       {
//         "message": "\"id\" length must be 24 characters long",
//         "path": [
//           "id"
//         ],
//         "type": "string.length",
//         "context": {
//           "limit": 24,
//           "value": "644c1f846b185362168ecc78a",
//           "label": "id",
//           "key": "id"
//         }
//       }
//     ]
//   }
type ServerError = AxiosError<{
  message: null;
  error:
    | {
        description: string;
        details: {
          message: string;
          path: string[];
          type: string;
          context: {
            limit: number;
            value: string;
            label: string;
            key: string;
          };
        }[];
      }
    | "Unauthorized";
}>;

export default ServerError;

export function isServerError(error: unknown): error is ServerError {
  return isAxiosError(error) && error.response?.data?.error;
}
