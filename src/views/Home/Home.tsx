import "moment/locale/es-mx";
import moment from "moment";
import { Box, Button, Typography } from "@mui/material";
import Student from "../../types/student.type";
import { useLayoutEffect, useState } from "react";
import { useAdmin } from "../../context/admin.context";
import { useCareers } from "../../context/careers.context";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setAdminParams } from "../../utils/setAdminParams";
import { useStudents } from "../../context/students.context";
import useRedirectIfTrue from "../../hooks/useRedirectIfTrue";
import { CenteredCircularProgress } from "../../components/Mixins";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import { DataGrid, GridColDef, GridPagination } from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";

moment.locale("es-mx");

const columns: GridColDef[] = [
  { field: "name", headerName: "Nombre", width: 300 },
  { field: "career", headerName: "Carrera", width: 300 },
  { field: "status", headerName: "Estatus", width: 150 },
  {
    width: 200,
    field: "createdAt",
    headerName: "Fecha de registro",
    valueFormatter: ({ value }: { value: Date }) => capitalizeFirstLetter(moment(value).fromNow()),
  },
];

interface Row {
  id: Student["id"];
  name: string;
  status: string;
  career: string;
  createdAt: Date;
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
    if (students !== null && careers !== null)
      setRows(
        students.map((s) => ({
          id: s.id,
          createdAt: s.createdAt,
          name: `${s.name} ${s.secondName}`,
          status: capitalizeFirstLetter(s.status),
          career: careers.find((c) => c.id === s.career)?.name ?? "No encontrada",
        }))
      );
  }, [students, careers]);

  const onCellClick = (id: Student["id"]) => {
    if (students && students.find((s) => s.id === id)) navigate(setAdminParams(`student/${id}`, admin));
  };

  if (admin === null) return null;
  return (
    <>
      <Box mt={3} mb={2} display="flex" sx={{ justifyContent: "space-between" }}>
        <Typography sx={{ ml: 3 }} variant="h4">{`Hola, ${admin.username}`}</Typography>
        <Link to={setAdminParams("student", admin)}>
          <Button variant="contained" endIcon={<Add />}>
            Registrar estudiante
          </Button>
        </Link>
      </Box>

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
          initialState={{
            pagination: { paginationModel: { pageSize, page } },
            sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
          }}
        />
      )}
    </>
  );
}
