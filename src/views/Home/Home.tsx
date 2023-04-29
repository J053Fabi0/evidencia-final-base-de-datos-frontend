import { Typography } from "@mui/material";
import Student from "../../types/student.type";
import { useLayoutEffect, useState } from "react";
import { useAdmin } from "../../context/admin.context";
import { useCareers } from "../../context/careers.context";
import { useLocation, useNavigate } from "react-router-dom";
import { setAdminParams } from "../../utils/setAdminParams";
import { useStudents } from "../../context/students.context";
import useRedirectIfTrue from "../../hooks/useRedirectIfTrue";
import { CenteredCircularProgress } from "../../components/Mixins";
import { DataGrid, GridColDef, GridPagination } from "@mui/x-data-grid";

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

const pageSize = 9;

export default function Home() {
  const admin = useAdmin();
  useRedirectIfTrue(admin === null, "/signin");

  const navigate = useNavigate();
  const students = useStudents();
  const careers = useCareers();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const page = (parseInt(queryParams.get("page") ?? "1") || 1) - 1;
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

  const onCellClick = (id: Student["id"]) => {
    if (students && students.find((s) => s.id === id)) navigate(setAdminParams(`student/${id}`, admin));
  };

  if (admin === null) return null;
  return (
    <>
      <Typography sx={{ my: 3 }} variant="h4">{`Hola, ${admin.username}`}</Typography>

      {loading ? (
        <CenteredCircularProgress />
      ) : (
        <DataGrid
          pagination
          rows={rows}
          columns={columns}
          onPaginationModelChange={(params) => {
            // navigate(setAdminParams("", admin, { page: params.page.toString() }));
            // set the page param in the url without changing the current params
            // and without using navigate
            if (params.page === 0) queryParams.delete("page");
            else queryParams.set("page", (params.page + 1).toString());
            navigate({ search: queryParams.toString() }, { replace: true });
          }}
          rowSelection={false}
          slots={{ pagination: GridPagination }}
          onRowClick={(params) => onCellClick(params.id as Student["id"])}
          initialState={{ pagination: { paginationModel: { pageSize, page } } }}
        />
      )}
    </>
  );
}
