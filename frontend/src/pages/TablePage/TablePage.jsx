import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import requests from "../../utils/requests";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TablePage() {
  const navigate = useNavigate();

  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  const { tableName } = useParams();

  const loadTableData = useCallback(
    async (params = {}) => {
      try {
        const response = await requests.get(`/${tableName}`);
        const data = response.data;

        if (data.length > 0) {
          const columns = Object.keys(data[0]).map((key) => ({
            headerName: key,
            field: key,
            sortable: true,
            filter: true,
            resizable: true,
          }));
          setColumnDefs(columns);
        }

        setRowData(data);
      } catch (error) {
        console.error("Error loading table data:", error);
      }
    },
    [tableName, navigate],
  );

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <AgGridReact rowData={rowData} columnDefs={columnDefs} />
    </div>
  );
}
