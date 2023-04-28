import { Typography, Grid } from "@mui/material";
import { useAdmin } from "../../context/admin.context";
import StudentCard from "../../components/StudentCard";

const restaurants = [
  {
    title: "Tim Hortons",
    image: "https://i.pinimg.com/originals/57/6c/c4/576cc471c87ab79be68234fb15911c30.jpg",
    description: "Galletas muy ricas.",
    id: "tim",
  },
  {
    title: "Subway",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.schoolphotoproject.com%2F_picture-of-logos-brands%2Fsubway-logo-photo2-l.jpg&f=1&nofb=1&ipt=52ea3323ff5bb17f79ad5efa478742081d0d309e434d44b48c5efc925bd35966&ipo=images",
    description: "Uno del día sin carne mejor que vegetariano.",
    id: "subway",
  },
  {
    title: "Ji Xiang",
    image: "https://jixiangconfectionery.com.sg/wp-content/uploads/2021/01/jixiang-2021-new-logo.png",
    description: "Comida china.",
    id: "ji",
  },
];

export default function Home() {
  const admin = useAdmin();

  return admin ? (
    <>
      <Typography sx={{ mt: 3 }} variant="h4">{`Hola, ${admin.username}`}</Typography>

      <Grid container spacing={2}>
        {restaurants.map(({ title, description, image, id }) => (
          <Grid item xs={12} md={6} lg={4}>
            <StudentCard image={image} title={title} description={description} id={id} />
          </Grid>
        ))}
      </Grid>
    </>
  ) : null;
}
