import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemById } from "../../utils/requests";
import { Button } from "@mui/material";

export default function DetailPage() {
  const { tableName, id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setItem(await getItemById(tableName, id));
      } catch (error) {
        console.error("Error fetching item:", error);
      }
    };

    fetchItem();
  }, [tableName, id]);

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <Button
        variant="outlined"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      <h2>
        Details for {tableName} Item ID: {id}
      </h2>
      <table>
        <tbody>
          {Object.entries(item).map(([key, value]) => (
            <tr key={key}>
              <td style={{ fontWeight: "bold", paddingRight: 16 }}>{key}</td>
              <td>{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
