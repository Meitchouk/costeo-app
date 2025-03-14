'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Box
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type AccountRow = {
  id: number;
  name: string;
  amount: string;
};

export default function EstadoResultadosDetailed() {
  // Estados para cada sección
  const [ingresos, setIngresos] = useState<AccountRow[]>([{ id: Date.now(), name: '', amount: '' }]);
  const [costosVariables, setCostosVariables] = useState<AccountRow[]>([{ id: Date.now() + 1, name: '', amount: '' }]);
  const [costosFijos, setCostosFijos] = useState<AccountRow[]>([{ id: Date.now() + 2, name: '', amount: '' }]);

  const [metodo, setMetodo] = useState<string>('directo');
  const [resultado, setResultado] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mostrarEstado, setMostrarEstado] = useState<boolean>(false);

  // Funciones para agregar y quitar filas de cada sección
  const addRow = (section: 'ingresos' | 'costosVariables' | 'costosFijos') => {
    const newRow = { id: Date.now(), name: '', amount: '' };
    if (section === 'ingresos') {
      setIngresos((prev) => [...prev, newRow]);
    } else if (section === 'costosVariables') {
      setCostosVariables((prev) => [...prev, newRow]);
    } else if (section === 'costosFijos') {
      setCostosFijos((prev) => [...prev, newRow]);
    }
  };

  const removeRow = (section: 'ingresos' | 'costosVariables' | 'costosFijos', id: number) => {
    if (section === 'ingresos') {
      if (ingresos.length > 1)
        setIngresos((prev) => prev.filter((row) => row.id !== id));
    } else if (section === 'costosVariables') {
      if (costosVariables.length > 1)
        setCostosVariables((prev) => prev.filter((row) => row.id !== id));
    } else if (section === 'costosFijos') {
      if (costosFijos.length > 1)
        setCostosFijos((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const handleRowChange = (
    section: 'ingresos' | 'costosVariables' | 'costosFijos',
    id: number,
    field: 'name' | 'amount',
    value: string
  ) => {
    if (section === 'ingresos') {
      setIngresos((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    } else if (section === 'costosVariables') {
      setCostosVariables((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    } else if (section === 'costosFijos') {
      setCostosFijos((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    }
  };

  // Función para sumar montos de cada sección
  const sumRows = (rows: AccountRow[]) => rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

  const totalIngresos = sumRows(ingresos);
  const totalCostosVariables = sumRows(costosVariables);
  const totalCostosFijos = sumRows(costosFijos);

  // Cálculo del resultado según el método
  const calcularResultado = () => {
    if (isNaN(totalIngresos) || isNaN(totalCostosVariables) || isNaN(totalCostosFijos)) {
      setError('Revisa que todos los montos sean valores numéricos.');
      return;
    }
    setError(null);
    let resultadoCalculado = 0;
    if (metodo === 'directo') {
      // Costeo Directo: Se calcula el Margen de Contribución y luego se resta Costos Fijos
      resultadoCalculado = (totalIngresos - totalCostosVariables) - totalCostosFijos;
    } else if (metodo === 'absorcion') {
      // Costeo por Absorción: Se suman todos los costos y se restan de los ingresos
      resultadoCalculado = totalIngresos - (totalCostosVariables + totalCostosFijos);
    }
    setResultado(resultadoCalculado);
    setMostrarEstado(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calcularResultado();
  };

  // Preparar datos para el gráfico
  let dataChart = [];
  if (metodo === 'directo') {
    const margen = totalIngresos - totalCostosVariables;
    const utilNeta = margen - totalCostosFijos;
    dataChart = [
      { name: 'Ingresos Totales', value: totalIngresos },
      { name: 'Costos Variables', value: totalCostosVariables },
      { name: 'Margen de Contribución', value: margen },
      { name: 'Costos Fijos', value: totalCostosFijos },
      { name: 'Utilidad Neta', value: utilNeta }
    ];
  } else {
    const costoProduccion = totalCostosVariables + totalCostosFijos;
    const utilBruta = totalIngresos - costoProduccion;
    dataChart = [
      { name: 'Ingresos Totales', value: totalIngresos },
      { name: 'Costos de Producción', value: costoProduccion },
      { name: 'Utilidad Bruta', value: utilBruta }
    ];
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Estado de Resultados Detallado
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Sección de Ingresos */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ingresos
          </Typography>
          {ingresos.map((row) => (
            <Grid container spacing={2} key={row.id} alignItems="center">
              <Grid item xs={5}>
                <TextField
                  label="Cuenta"
                  variant="outlined"
                  fullWidth
                  value={row.name}
                  onChange={(e) => handleRowChange('ingresos', row.id, 'name', e.target.value)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Monto"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={row.amount}
                  onChange={(e) => handleRowChange('ingresos', row.id, 'amount', e.target.value)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  color="error"
                  onClick={() => removeRow('ingresos', row.id)}
                  disabled={ingresos.length === 1}
                >
                  <RemoveCircleIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Button variant="outlined" onClick={() => addRow('ingresos')} startIcon={<AddCircleIcon />}>
              Agregar Ingreso
            </Button>
          </Box>
        </Paper>

        {/* Sección de Costos Variables */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Costos Variables
          </Typography>
          {costosVariables.map((row) => (
            <Grid container spacing={2} key={row.id} alignItems="center">
              <Grid item xs={5}>
                <TextField
                  label="Cuenta"
                  variant="outlined"
                  fullWidth
                  value={row.name}
                  onChange={(e) => handleRowChange('costosVariables', row.id, 'name', e.target.value)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Monto"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={row.amount}
                  onChange={(e) => handleRowChange('costosVariables', row.id, 'amount', e.target.value)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  color="error"
                  onClick={() => removeRow('costosVariables', row.id)}
                  disabled={costosVariables.length === 1}
                >
                  <RemoveCircleIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Button variant="outlined" onClick={() => addRow('costosVariables')} startIcon={<AddCircleIcon />}>
              Agregar Costo Variable
            </Button>
          </Box>
        </Paper>

        {/* Sección de Costos Fijos */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Costos Fijos
          </Typography>
          {costosFijos.map((row) => (
            <Grid container spacing={2} key={row.id} alignItems="center">
              <Grid item xs={5}>
                <TextField
                  label="Cuenta"
                  variant="outlined"
                  fullWidth
                  value={row.name}
                  onChange={(e) => handleRowChange('costosFijos', row.id, 'name', e.target.value)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="Monto"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={row.amount}
                  onChange={(e) => handleRowChange('costosFijos', row.id, 'amount', e.target.value)}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  color="error"
                  onClick={() => removeRow('costosFijos', row.id)}
                  disabled={costosFijos.length === 1}
                >
                  <RemoveCircleIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Button variant="outlined" onClick={() => addRow('costosFijos')} startIcon={<AddCircleIcon />}>
              Agregar Costo Fijo
            </Button>
          </Box>
        </Paper>

        {/* Selección del método de costeo */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Método de Costeo</InputLabel>
          <Select
            label="Método de Costeo"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as string)}
          >
            <MenuItem value="directo">Costeo Directo</MenuItem>
            <MenuItem value="absorcion">Costeo por Absorción</MenuItem>
          </Select>
        </FormControl>

        {error && (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {/* <Box sx={{ my: 2 }}>
          <Button variant="contained" type="submit">
            Calcular Estado de Resultados
          </Button>
        </Box> */}
      </form>

      {mostrarEstado && (
        <>
          {/* Desglose del Estado de Resultados */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Resumen del Estado de Resultados
            </Typography>
            {metodo === 'directo' ? (
              <>
                <Typography>Ingresos Totales: {totalIngresos.toFixed(2)}</Typography>
                <Typography>(-) Costos Variables: {totalCostosVariables.toFixed(2)}</Typography>
                <Typography>= Margen de Contribución: {(totalIngresos - totalCostosVariables).toFixed(2)}</Typography>
                <Typography>(-) Costos Fijos: {totalCostosFijos.toFixed(2)}</Typography>
                <Typography>= Utilidad Neta: {resultado?.toFixed(2)}</Typography>
              </>
            ) : (
              <>
                <Typography>Ingresos Totales: {totalIngresos.toFixed(2)}</Typography>
                <Typography>(-) Costos de Producción: {(totalCostosVariables + totalCostosFijos).toFixed(2)}</Typography>
                <Typography>= Utilidad Bruta: {resultado?.toFixed(2)}</Typography>
              </>
            )}
          </Paper>

          {/* Gráfico para visualizar el desglose */}
          <Paper elevation={3} sx={{ p: 3, mb: 10 }}>
            <Typography variant="h6" gutterBottom>
              Gráfico de Análisis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Monto" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </>
      )}
    </Container>
  );
}
