import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, LinearProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/admin.context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { setAdminParams } from "../../utils/setAdminParams";
import useRedirectIfTrue from "../../hooks/useRedirectIfTrue";
import Student, { StudentRaw } from "../../types/student.type";
import http from "../../http-common";

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

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { data } = await http.get<{ message: StudentRaw[] }>("/students");
      setStudents(data.message.map(({ birthDate, ...s }) => ({ birthDate: new Date(birthDate), ...s })));
      setLoading(false);
    })();
  }, []);

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
