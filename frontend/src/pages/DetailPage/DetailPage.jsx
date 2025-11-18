import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemById, updateItemById, addItem } from "../../utils/requests";
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

import Toast from "../../components/Toast";

import classNames from "classnames/bind";
import styles from "./DetailPage.module.css";

const cx = classNames.bind(styles);

export default function DetailPage() {
  const { tableName, id } = useParams();
  const navigate = useNavigate();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastStatus, setToastStatus] = useState("");

  const [item, setItem] = useState(null);
  const [updatedItem, setUpdatedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setItem(await getItemById(tableName, id));
      } catch (error) {
        setToastMessage("Failed to load data!");
        setToastStatus("error");
        setToastOpen(true);
      }
    };

    fetchItem();
  }, [tableName, id]);

  if (!item) {
    return <div>Loading...</div>;
  }

  const handleEdit = () => {
    setUpdatedItem(item);
    setEditMode(true);
  };

  const handleSaveAsNewItem = () => {
    const saveAsNew = async () => {
      try {
        const { ID, ...itemWithoutId } = updatedItem;
        const newItem = await addItem(tableName, itemWithoutId);
        navigate(`/${tableName}/${newItem.ID}`);
        setEditMode(false);
        setToastMessage("New item saved successfully!");
        setToastStatus("success");
        setToastOpen(true);
      } catch (error) {
        setToastMessage("Failed to save as new item!");
        setToastStatus("error");
        setToastOpen(true);
      }
    };
    saveAsNew();
  };

  const handleSave = () => {
    const saveChanges = async () => {
      try {
        setItem(await updateItemById(tableName, id, updatedItem));
        setEditMode(false);
        setToastMessage("Item updated successfully!");
        setToastStatus("success");
        setToastOpen(true);
      } catch (error) {
        setToastMessage("Failed to save changes!");
        setToastStatus("error");
        setToastOpen(true);
      }
    };
    saveChanges();
  };

  const handleCancel = () => setEditMode(false);

  return (
    <Box className={cx("main-container")}>
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastStatus}
        onClose={() => setToastOpen(false)}
      />
      <Box className={cx("header-container")} direction="row">
        <Box className={cx("back-button")}>
          <Button variant="outlined" onClick={() => navigate(`/${tableName}`)}>
            Back
          </Button>
        </Box>
        <Typography className={cx("header-title")} variant="h4">
          Details for {tableName} Item ID: {id}
        </Typography>
      </Box>
      {editMode ? (
        <Box className={cx("edit-form")}>
          {Object.entries(updatedItem)
            .filter(([key]) => key.toUpperCase() !== "ID")
            .map(([key, value]) => (
              <TextField
                key={key}
                label={key}
                value={value}
                onChange={(e) => {
                  setUpdatedItem((prev) => ({
                    ...prev,
                    [key]:
                      typeof item[key] === "number"
                        ? Number(e.target.value) || e.target.value
                        : e.target.value,
                  }));
                }}
                fullWidth
              />
            ))}
          <Stack direction="row" className={cx("buttons-group")}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleSaveAsNewItem}
            >
              Save as new item
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={JSON.stringify(item) === JSON.stringify(updatedItem)}
            >
              Save
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Box>
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
