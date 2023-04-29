import { useMemo, useState } from "react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/admin.context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { setAdminParams } from "../../utils/setAdminParams";
import useRedirectIfTrue from "../../hooks/useRedirectIfTrue";
import Student, { StudentRaw } from "../../types/student.type";

const studentsRawTest: StudentRaw[] = [
  {
    name: "Jose Fabio",
    status: "inscrito",
    secondName: "Argüello Loya",
    id: "644c214c5ac68ce59fc15b5b",
    career: "644c104a4031f55e67ed8daa",
    birthDate: "2001-01-01T00:00:00.000Z",
  },
  {
    name: "Andrea",
    status: "inscrito",
    secondName: "González",
    id: "644c214c5ac68ce59fc15b5c",
    career: "644c104a4031f55e67ed8daa",
    birthDate: "2001-01-01T00:00:00.000Z",
  },
  {
    name: "Juan",
    status: "inscrito",
    secondName: "Pérez",
    id: "644c214c5ac68ce59fc15b5d",
    career: "644c104a4031f55e67ed8daa",
    birthDate: "2001-01-01T00:00:00.000Z",
  },
];

const currentYear = new Date().getFullYear();

const columns: GridColDef[] = [
  { field: "name", headerName: "Nombre", width: 300 },
  { field: "status", headerName: "Estatus", width: 150 },
  { field: "years", headerName: "Años" },
  { field: "career", headerName: "Carrera", width: 300 },
];

export default function Home() {
  const admin = useAdmin();
  useRedirectIfTrue(admin === null, "/signin");

  const navigate = useNavigate();

  const [studentsRaw] = useState<StudentRaw[]>(studentsRawTest);

  const students: Student[] = useMemo(
    () => studentsRaw.map(({ birthDate, ...s }) => ({ birthDate: new Date(birthDate), ...s })),
    [studentsRaw]
  );

  const rows = useMemo(
    () =>
      students.map((s) => ({
        id: s.id,
        career: s.career,
        name: `${s.name} ${s.secondName}`,
        years: currentYear - s.birthDate.getFullYear(),
        status: s.status.slice(0, 1).toUpperCase() + s.status.slice(1),
      })),
    [students]
  );

  const onCellClick = (id: Student["id"]) => navigate(setAdminParams(id, admin));

  if (admin === null) return null;
  return (
    <>
      <Typography sx={{ my: 3 }} variant="h4">{`Hola, ${admin.username}`}</Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        paginationModel={{ page: 0, pageSize: 20 }}
        onCellClick={(params) => {
          if (params.field === "name") onCellClick(params.id as Student["id"]);
        }}
      />
    </>
  );
}
