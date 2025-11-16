import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Paper, Typography } from "@mui/material";

import classNames from "classnames/bind";
import styles from "./HomePage.module.css";

const cx = classNames.bind(styles);

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    const tableName = search.trim();
    if (tableName) {
      navigate(`/${tableName}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box className={cx("container")}>
      <Paper elevation={3} className={cx("search-wrapper")}>
        <Typography variant="h5" gutterBottom>
          Enter Table Name
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Table Name"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Go
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
