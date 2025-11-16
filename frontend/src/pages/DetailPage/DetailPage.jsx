import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemById, updateItemById } from "../../utils/requests";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import classNames from "classnames/bind";
import styles from "./DetailPage.module.css";

const cx = classNames.bind(styles);

export default function DetailPage() {
  const { tableName, id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setItem(await getItemById(tableName, id));
      } catch (error) {
        alert("Can't load item :(");
      }
    };

    fetchItem();
  }, [tableName, id]);

  if (!item) {
    return <div>Loading...</div>;
  }

  const handleEdit = () => {
    setEditMode(true);
    setHasChanges(false);
  };

  const handleSave = () => {
    updateItemById(tableName, id, item);
    setEditMode(false);
  };

  const handleCancel = () => setEditMode(false);

  return (
    <Box className={cx("main-container")}>
      <Button
        className={cx("button")}
        variant="outlined"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Typography variant="h2">
        Details for {tableName} Item ID: {id}
      </Typography>
      {editMode ? (
        <Stack spacing={2}>
          {Object.entries(item).map(([key, value]) => (
            <TextField
              key={key}
              label={key}
              value={value}
              onChange={(e) => {
                setItem((prev) => ({ ...prev, [key]: e.target.value }));
                setHasChanges(true);
              }}
              fullWidth
            />
          ))}
          <Stack>
            <Button
              className={cx("button")}
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save
            </Button>
            <Button
              className={cx("button")}
              variant="outlined"
              color="error"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      ) : (
        <>
          <Table>
            <TableBody>
              {Object.entries(item).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell style={{ fontWeight: "bold", paddingRight: 16 }}>
                    {key}
                  </TableCell>
                  <TableCell>{String(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            className={cx("button")}
            variant="contained"
            color="primary"
            onClick={handleEdit}
            style={{ marginTop: 16 }}
          >
            Edit
          </Button>
        </>
      )}
    </Box>
  );
}
