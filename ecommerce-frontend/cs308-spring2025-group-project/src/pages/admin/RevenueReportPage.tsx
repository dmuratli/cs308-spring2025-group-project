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
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ComposedChart,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";

const MotionPaper = motion(Paper);

/* ------------------------------------------------------------------ */
/* yardımcı                                                            */
/* ------------------------------------------------------------------ */

const toISODate = (dateStr: string) => {
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
};

interface ChartDatum {
  name: string;
  value: number;
  amt?: number; // çizgi için
}

const COLORS = ["#FFA559", "#FFCE91", "#7CCBA2"]; // pie paleti

/* ------------------------------------------------------------------ */
/* sayfa                                                               */
/* ------------------------------------------------------------------ */

const RevenueReportPage: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<{
    revenue: number;
    cost: number;
    profit: number;
    chart: ChartDatum[];
  } | null>(null);
  const [error, setError] = useState("");

  /* -------------------------------------------------------------- */
  /* istek --------------------------------------------------------- */
  /* -------------------------------------------------------------- */
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

      const res = await axios.get(
        "http://localhost:8000/api/orders/revenue-report/",
        {
          params: { start: toISODate(startDate), end: toISODate(endDate) },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const chartData: ChartDatum[] = [
        { name: "Revenue", value: res.data.revenue },
        { name: "Cost", value: res.data.cost },
        {
          name: res.data.profit >= 0 ? "Profit" : "Loss",
          value: Math.abs(res.data.profit),
        },
      ];

      // çizgi için ‘amt’ ekle (cumulative)
      let cumulative = 0;
      chartData.forEach((d) => {
        cumulative += d.value;
        d.amt = cumulative;
      });

      setResult({ ...res.data, chart: chartData });
      setError("");
    } catch {
      setError("Something went wrong. Please try again.");
      setResult(null);
    }
  };

  /* -------------------------------------------------------------- */
  /* render -------------------------------------------------------- */
  /* -------------------------------------------------------------- */
  return (
    <Box sx={{ backgroundColor: "#FFF5EC", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="sm">
        {/* başlık */}
        <Box textAlign="center" mb={4}>
          <InsertChartOutlined fontSize="large" sx={{ color: "#FFA559", mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="#FFA559">
            Revenue & Profit Report
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Select a date range to calculate sales performance
          </Typography>
        </Box>

        {/* kart */}
        <MotionPaper
          elevation={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.45 }}
          sx={{ p: 4, borderRadius: 4 }}
        >
          <Stack spacing={2}>
            {/* tarih girişleri */}
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

            {/* buton */}
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#FFA559",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#e68e3f" },
              }}
              onClick={handleCalculate}
            >
              Calculate
            </Button>

            {/* hata */}
            {error && (
              <Alert icon={<ErrorOutline fontSize="inherit" />} severity="error">
                {error}
              </Alert>
            )}

            {/* sonuç */}
            {result && (
              <>
                {/* özet kutusu */}
                <MotionPaper
                  elevation={2}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  sx={{
                    mt: 1,
                    p: 3,
                    backgroundColor: "#FFF0E6",
                    borderRadius: 3,
                    border: "1px solid #FFD7BA",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography>
                      <Paid sx={{ verticalAlign: "middle", mr: 1 }} />
                      <strong>Revenue:</strong> ${result.revenue.toFixed(2)}
                    </Typography>
                    <Typography>
                      <MoneyOff sx={{ verticalAlign: "middle", mr: 1 }} />
                      <strong>Cost:</strong> ${result.cost.toFixed(2)}
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
                          Profit: ${result.profit.toFixed(2)}
                        </>
                      ) : (
                        <>📉 Loss: ${result.profit.toFixed(2)}</>
                      )}
                    </Typography>
                  </Stack>
                </MotionPaper>

                {/* grafikler */}
                {result.revenue > 0 && (
                  <>
                    {/* bar + line (composed) */}
                    <Box mt={4} height={260}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={result.chart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend
                            iconType="circle"
                            wrapperStyle={{ paddingTop: 8 }}
                          />
                          <Bar
                            dataKey="value"
                            name="Amount"
                            fill="#FFA559"
                            radius={[8, 8, 0, 0]}
                          />
                          <Line
                            type="monotone"
                            dataKey="amt"
                            name="Cumulative"
                            stroke="#7CCBA2"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* pasta (donut) */}
                    <Box mt={4} height={260}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                          />
                          <Tooltip />
                          <Pie
                            data={result.chart}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                            isAnimationActive
                          >
                            {result.chart.map((entry, index) => (
                              <Cell
                                key={`slice-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                            <Label
                              value="USD"
                              position="center"
                              style={{ fontSize: "0.8rem", fill: "#888" }}
                            />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </>
                )}
              </>
            )}

            {/* boş dönem */}
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
