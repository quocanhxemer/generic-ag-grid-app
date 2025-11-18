import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

import { deleteItem, getItems, updateItemById } from "../../utils/requests";
import useDebounce from "../../hooks/useDebounce";

import classNames from "classnames/bind";
import styles from "./TablePage.module.css";

const cx = classNames.bind(styles);

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TablePage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [columnDefs, setColumnDefs] = useState([]);
  const [gridApi, setGridApi] = useState(null);

  const { tableName } = useParams();

  useEffect(() => {
    const loadColumnsNames = async () => {
      try {
        // Get 1 row to determine columns
        const data = await getItems(tableName, { offset: 0, limit: 1 });

        if (data.length === 0) {
          setColumnDefs([]);
          return;
        }

        const columns = Object.keys(data[0]).map((key) => ({
          headerName: key,
          field: key,
          sortable: true,
          filter: true,
          filterParams: {
            filterOptions: [
              "contains",
              "notContains",
              "equals",
              "notEqual",
              "startsWith",
              "endsWith",
              "blank",
              "notBlank",
              "greaterThan",
              "lessThan",
            ],
            maxNumConditions: 4,
          },
          resizable: true,
          editable: key.toUpperCase() !== "ID",
        }));
        columns.unshift({
          headerName: "Actions",
          field: "actions",
          cellRenderer: (params) => (
            <Box className={cx("actions-cell")}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${tableName}/${params.data.ID}`)}
              >
                View
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                  await deleteItem(tableName, params.data.ID);
                  params.api.refreshInfiniteCache();
                }}
              >
                Delete
              </Button>
            </Box>
          ),
        });
        setColumnDefs(columns);
      } catch (error) {
        alert("Error loading table data :(");
      }
    };
    loadColumnsNames();
  }, [tableName, navigate]);

  const defaultColDef = {
    cellRenderer: ({ value }) =>
      value === undefined ? <CircularProgress /> : value,
  };

  const datasource = useMemo(
    () => ({
      getRows: async (rowParams) => {
        const { startRow, endRow, filterModel, sortModel } = rowParams;
        const pageSize = endRow - startRow;

        const requestParams = {
          offset: startRow,
          limit: pageSize,
          filters: filterModel,
          sort: sortModel,
          search: debouncedSearch.trim(),
        };

        try {
          const data = await getItems(tableName, requestParams);
          rowParams.successCallback(
            data,
            data.length < pageSize ? startRow + data.length : -1,
          );
        } catch (error) {
          alert("Error fetching rows :(");
          rowParams.failCallback();
        }
      },
    }),
    [tableName, debouncedSearch],
  );

  const handleCellEdit = async (params) => {
    const updatedData = params.data;
    const id = updatedData.ID;

    try {
      await updateItemById(tableName, id, updatedData);
    } catch (error) {
      alert("Error updating item :(");
    }
  };

  return (
    <Box className={cx("main-container")}>
      <Box className={cx("search-container")}>
        <Typography className={cx("table-title")} variant="h4" gutterBottom>
          Viewing table: {tableName}
        </Typography>
        <TextField
          label="Search"
          name="search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      <AgGridReact
        onGridReady={(params) => setGridApi(params.api)}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowModelType="infinite"
        datasource={datasource}
        onCellValueChanged={handleCellEdit}
      />
    </Box>
  );
}
