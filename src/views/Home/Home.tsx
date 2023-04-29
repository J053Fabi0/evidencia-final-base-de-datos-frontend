import http from "../../http-common";
import { useEffect, useState } from "react";
import Career from "../../types/career.type";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/admin.context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { setAdminParams } from "../../utils/setAdminParams";
import { CircularProgress, Typography } from "@mui/material";
import useRedirectIfTrue from "../../hooks/useRedirectIfTrue";
import Student, { StudentRaw } from "../../types/student.type";

const currentYear = new Date().getFullYear();

const columns: GridColDef[] = [
  { field: "name", headerName: "Nombre", width: 300 },
  { field: "status", headerName: "Estatus", width: 150 },
  { field: "years", headerName: "Años" },
  { field: "career", headerName: "Carrera", width: 300 },
];

interface Row {
  id: Student["id"];
  name: string;
  status: string;
  years: number;
  career: string;
}

export default function Home() {
  const admin = useAdmin();
  useRedirectIfTrue(admin === null, "/signin");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      // Simulate loading for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the data
      const { message: students } = (await http.get<{ message: StudentRaw[] }>("/students")).data;
      const { message: careers } = (await http.get<{ message: Career[] }>("/careers")).data;

      // Set the rows
      setRows(
        students.map((s) => ({
          id: s.id,
          name: `${s.name} ${s.secondName}`,
          years: currentYear - new Date(s.birthDate).getFullYear(),
          status: s.status.slice(0, 1).toUpperCase() + s.status.slice(1),
          career: careers.find((c) => c.id === s.career)?.name ?? "No encontrada",
        }))
      );

      // Stop loading
      setLoading(false);
    })();
  }, []);

  const onCellClick = (id: Student["id"]) => navigate(setAdminParams(id, admin));

  if (admin === null) return null;
  return (
    <>
      <Typography sx={{ my: 3 }} variant="h4">{`Hola, ${admin.username}`}</Typography>

      {loading ? (
        <CircularProgress
          sx={{ top: "50%", left: "50%", position: "absolute", transform: "translate(-50%, -50%)" }}
        />
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          paginationModel={{ page: 0, pageSize: 20 }}
          onCellClick={(params) => {
            if (params.field === "name") onCellClick(params.id as Student["id"]);
          }}
        />
      )}
    </>
  );
}
