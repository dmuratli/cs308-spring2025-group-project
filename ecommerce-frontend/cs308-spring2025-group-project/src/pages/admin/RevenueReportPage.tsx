import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Stack,
  Alert,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import {
  TrendingUp,
  MoneyOff,
  Paid,
  ErrorOutline,
  InsertChartOutlined,
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

const MotionPaper = motion(Paper);

const toISODate = (dateStr: string) => {
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
};

const RevenueReportPage: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    if (!startDate || !endDate || startDate > endDate) {
      setError("Please select a valid date range.");
      setResult(null);
      return;
    }

    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

      const res = await axios.get("http://localhost:8000/api/orders/revenue-report/", {
        params: {
          start: toISODate(startDate),
          end: toISODate(endDate),
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const chartData = [
        { name: "Revenue", value: res.data.revenue },
        { name: "Cost", value: res.data.cost },
        {
          name: res.data.profit >= 0 ? "Profit" : "Loss",
          value: Math.abs(res.data.profit),
        },
      ];

      setResult({ ...res.data, chart: chartData });
      setError("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setResult(null);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#FFF5EC", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="sm">
        <Box textAlign="center" mb={4}>
          <InsertChartOutlined fontSize="large" sx={{ color: "#FFA559", mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="#FFA559">
            Revenue & Profit Report
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Select a date range to calculate sales performance
          </Typography>
        </Box>

        <MotionPaper
          elevation={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5 }}
          sx={{ p: 4, borderRadius: 4 }}
        >
          <Stack spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#FFA559",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#e68e3f",
                },
              }}
              onClick={handleCalculate}
            >
              Calculate
            </Button>

            {error && (
              <Alert icon={<ErrorOutline fontSize="inherit" />} severity="error">
                {error}
              </Alert>
            )}

            {result && (
              <>
                <MotionPaper
                  elevation={2}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  sx={{
                    mt: 2,
                    p: 3,
                    backgroundColor: "#FFF0E6",
                    borderRadius: 3,
                    border: "1px solid #FFD7BA",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography>
                      <Paid sx={{ verticalAlign: "middle", mr: 1 }} />
                      <strong>Revenue:</strong> ₺{result.revenue.toFixed(2)}
                    </Typography>
                    <Typography>
                      <MoneyOff sx={{ verticalAlign: "middle", mr: 1 }} />
                      <strong>Cost:</strong> ₺{result.cost.toFixed(2)}
                    </Typography>
                    <Divider />
                    <Typography
                      sx={{
                        color: result.profit >= 0 ? "green" : "red",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {result.profit >= 0 ? (
                        <>
                          <TrendingUp sx={{ verticalAlign: "middle", mr: 1 }} />
                          Profit: ₺{result.profit.toFixed(2)}
                        </>
                      ) : (
                        <>
                          📉 Loss: ₺{result.profit.toFixed(2)}
                        </>
                      )}
                    </Typography>
                  </Stack>
                </MotionPaper>

                {/* Chart Section */}
                {result.revenue > 0 && (
                  <Box mt={4} height={250}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="value"
                          fill="#FFA559"
                          radius={[10, 10, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </>
            )}

            {result && result.revenue === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No revenue data found for the selected period.
              </Alert>
            )}
          </Stack>
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default RevenueReportPage;
