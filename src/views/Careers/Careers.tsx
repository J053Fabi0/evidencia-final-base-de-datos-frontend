import { Add } from "@mui/icons-material";
import Career from "../../types/career.type";
import { useLayoutEffect, useState } from "react";
import { useAdmin } from "../../context/admin.context";
import { Box, Button, Typography } from "@mui/material";
import { useCareers } from "../../context/careers.context";
import { setAdminParams } from "../../utils/setAdminParams";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CenteredCircularProgress } from "../../components/Mixins";
import { DataGrid, GridColDef, GridPagination } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "name", headerName: "Nombre", width: 450 },
  { field: "totalStudents", headerName: "Total", width: 100 },
  { field: "activeStudents", headerName: "Inscritos", width: 100 },
  { field: "inactiveStudents", headerName: "No inscritos", width: 100 },
];

interface Row {
  name: string;
  id: Career["id"];
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}

const pageSize = 9;

export default function Careers() {
  const admin = useAdmin();
  const careers = useCareers();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [rows, setRows] = useState<Row[]>([]);
  const queryParams = new URLSearchParams(search);
  const page = (parseInt(queryParams.get("page") ?? "1") || 1) - 1;

  useLayoutEffect(() => {
    if (careers !== null)
      setRows(
        careers.map((c) => ({
          id: c.id,
          name: c.name,
          totalStudents: c.totalStudents,
          activeStudents: c.activeStudents,
          inactiveStudents: c.inactiveStudents,
        }))
      );
  }, [careers]);

  const onCellClick = (id: Career["id"]) => {
    if (careers && careers.find((c) => c.id === id)) navigate(setAdminParams(`/career/${id}`, admin));
  };

  if (admin === null) return null;
  return (
    <>
      <Box mt={3} mb={2} sx={{ justifyContent: { sm: "space-between" }, display: { sm: "flex" } }}>
        <Typography sx={{ ml: { sm: 1 }, mb: { xs: 2, sm: 0 } }} variant="h4">
          Carreras
        </Typography>

        <Box
          sx={{
            width: { xs: "100%", sm: "auto" },
            display: { xs: "flex", sm: "block" },
            justifyContent: { xs: "end", sm: "flex-end" },
          }}
        >
          <Link to={setAdminParams("/career/new", admin)}>
            <Button variant="contained" endIcon={<Add />}>
              Crear carrera
            </Button>
          </Link>
        </Box>
      </Box>

      {!careers ? (
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
          onRowClick={(params) => onCellClick(params.id as Career["id"])}
          initialState={{
            pagination: { paginationModel: { pageSize, page } },
            sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
          }}
        />
      )}
    </>
  );
}
