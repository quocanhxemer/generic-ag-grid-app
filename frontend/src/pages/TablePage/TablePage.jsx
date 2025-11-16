import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { Button, TextField } from "@mui/material";

import { deleteItem, getItems, updateItemById } from "../../utils/requests";
import useDebounce from "../../hooks/useDebounce";

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

        if (data.length > 0) {
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
            editable: key !== "id",
          }));
          columns.unshift({
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params) => (
              <div>
                <button
                  onClick={() => navigate(`/${tableName}/${params.data.id}`)}
                >
                  View
                </button>
                <button
                  onClick={async () => {
                    await deleteItem(tableName, params.data.id);
                    params.api.refreshInfiniteCache();
                  }}
                >
                  Delete
                </button>
              </div>
            ),
          });
          setColumnDefs(columns);
        }
      } catch (error) {
        alert("Error loading table data :(");
      }
    };
    loadColumnsNames();
  }, [tableName, navigate]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    gridApi.refreshInfiniteCache();
  };

  const handleCellEdit = async (params) => {
    const updatedData = params.data;
    const id = updatedData.id;

    try {
      await updateItemById(tableName, id, updatedData);
    } catch (error) {
      alert("Error updating item :(");
    }
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <form onSubmit={handleSearch} style={{ marginBottom: "10px" }}>
        <TextField
          label="Search"
          name="search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          {" "}
          Search{" "}
        </Button>
      </form>
      <AgGridReact
        onGridReady={(params) => setGridApi(params.api)}
        columnDefs={columnDefs}
        rowModelType="infinite"
        datasource={datasource}
        onCellValueChanged={handleCellEdit}
      />
    </div>
  );
}
