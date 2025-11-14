import HomePage from "../pages/HomePage";
import TablePage from "../pages/TablePage";
import DetailPage from "../pages/DetailPage";

export const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/:tableName", element: <TablePage /> },
  { path: "/:tableName/:id", element: <DetailPage /> },
];
