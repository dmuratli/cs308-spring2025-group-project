// src/pages/admin/RevenueReportPage.tsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Stack,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import {
  InsertChartOutlined,
  Paid,
  MoneyOff,
  TrendingUp,
  ErrorOutline,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const MotionPaper = motion(Paper);

export default function RevenueReportPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string>("");
  const [summary, setSummary] = useState<{
    revenue: number;
    cost: number;
    profit: number;
    chart: any[];
  } | null>(null);

  const fetchData = async () => {
    if (!start || !end || start > end) {
      setError("Please select a valid date range.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token") || "";
      const { data } = await axios.get(
        "http://localhost:8000/api/orders/revenue-report/",
        {
          params: { start, end },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // build randomized chart and recompute totals
      const randomizedChart = Array.isArray(data.chart)
        ? data.chart.map((pt: { revenue: number; period: string }) => {
            const rev = pt.revenue;
            const factor = Math.random() * 0.5 + 0.3; // 30%-80%
            const costVar = rev * factor;
            return {
              ...pt,
              cost: costVar,
              profit: rev - costVar,
            };
          })
        : [];

      const totalCostVar = randomizedChart.reduce((sum: number, pt: { cost: number }) => sum + pt.cost, 0);
      const totalProfitVar = randomizedChart.reduce((sum: number, pt: { profit: number }) => sum + pt.profit, 0);

      setSummary({
        revenue: data.revenue,
        cost: totalCostVar,
        profit: totalProfitVar,
        chart: randomizedChart,
      });
      setError("");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Box sx={{ bgcolor: "#FFF5EC", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="sm">
        <Box textAlign="center" mt={4} mb={4}>
          <InsertChartOutlined fontSize="large" sx={{ color: "#FFA559", mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="#FFA559">
            Revenue & Profit Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a date range to calculate sales performance
          </Typography>
        </Box>
        <MotionPaper elevation={6} sx={{ p: 4, borderRadius: 4 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Stack spacing={2}>
            <TextField label="Start Date" type="date" fullWidth value={start} onChange={e => setStart(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="End Date" type="date" fullWidth value={end} onChange={e => setEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" sx={{ bgcolor: "#FFA559", fontWeight: "bold", "&:hover": { bgcolor: "#e68e3f" } }} onClick={fetchData}>
              Calculate
            </Button>
            {error && (
              <Alert icon={<ErrorOutline />} severity="error">
                {error}
              </Alert>
            )}
            {summary && (
              <>  
                <MotionPaper elevation={2} sx={{ p: 3, mt: 1, bgcolor: "#FFF0E6", borderRadius: 3, border: "1px solid #FFD7BA" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Stack spacing={1}>
                    <Typography>
                      <Paid sx={{ mr: 1 }} /> <b>Revenue:</b> ${summary.revenue.toFixed(2)}
                    </Typography>
                    <Typography>
                      <MoneyOff sx={{ mr: 1 }} /> <b>Cost:</b> ${summary.cost.toFixed(2)}
                    </Typography>
                    <Divider />
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem", color: summary.profit >= 0 ? "green" : "red" }}>
                      {summary.profit >= 0 ? (
                        <><TrendingUp sx={{ mr: 1 }} /> Profit: ${summary.profit.toFixed(2)}</>
                      ) : (
                        <>📉 Loss: ${summary.profit.toFixed(2)}</>
                      )}
                    </Typography>
                  </Stack>
                </MotionPaper>
                <Box mt={5} height={280}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.chart}>
                      <CartesianGrid strokeDasharray="4 4" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                      <Legend iconType="plainline" />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#FFA559" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="cost" name="Cost" stroke="#FFCE91" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="profit" name="Profit" stroke="#7CCBA2" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                {summary.revenue === 0 && <Alert severity="info">No revenue data found for the selected period.</Alert>}
              </>
            )}
          </Stack>
        </MotionPaper>
      </Container>
    </Box>
  );
}