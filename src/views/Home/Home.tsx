import { Typography } from "@mui/material";
import Student from "../../types/student.type";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useState } from "react";
import { useAdmin } from "../../context/admin.context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCareers } from "../../context/careers.context";
import { setAdminParams } from "../../utils/setAdminParams";
import { useStudents } from "../../context/students.context";
import useRedirectIfTrue from "../../hooks/useRedirectIfTrue";
import { CenteredCircularProgress } from "../../components/Mixins";

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
  const students = useStudents();
  const careers = useCareers();

  const [rows, setRows] = useState<Row[]>([]);
  const loading = students === null || careers === null;

  useLayoutEffect(() => {
    (async () => {
      // Get the data

      // Set the rows
      if (students !== null && careers !== null)
        setRows(
          students.map((s) => ({
            id: s.id,
            name: `${s.name} ${s.secondName}`,
            years: currentYear - s.birthDate.getFullYear(),
            status: s.status.slice(0, 1).toUpperCase() + s.status.slice(1),
            career: careers.find((c) => c.id === s.career)?.name ?? "No encontrada",
          }))
        );
    })();
  }, [students, careers]);

  const onCellClick = (id: Student["id"]) => navigate(setAdminParams(`student/${id}`, admin));

  if (admin === null) return null;
  return (
    <>
      <Typography sx={{ my: 3 }} variant="h4">{`Hola, ${admin.username}`}</Typography>

      {loading ? (
        <CenteredCircularProgress />
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          paginationModel={{ page: 0, pageSize: 9 }}
          onCellClick={(params) => {
            onCellClick(params.id as Student["id"]);
          }}
        />
      )}
    </>
  );
}
