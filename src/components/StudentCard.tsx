import * as React from "react";
import Card from "@mui/material/Card";
import { useNavigate } from "react-router-dom";
import { CardActionArea } from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import { setAdminParams } from "../utils/setAdminParams";
import { useAdmin } from "../context/admin.context";

type Params = {
  id: string;
  image: string;
  title: string;
  description: string;
};

export default function StudentCard({ image, title, description, id }: Params) {
  const admin = useAdmin();
  const navigate = useNavigate();

  const onCardClick = (id: string) => navigate(setAdminParams(id, admin));

  return (
    <Card sx={{ mt: 3, mb: 5 }} onClick={() => onCardClick(id)}>
      <CardActionArea>
        <CardMedia component="img" height="180" image={image} alt={title} />

        <CardContent>
          <Typography gutterBottom variant="h4" align="center">
            {title}
          </Typography>

          <Typography
            align="center"
            variant="body2"
            display="-webkit-box"
            color="text.secondary"
            sx={{
              "overflow": "hidden",
              "textOverflow": "ellipsis",
              "-webkit-line-clamp": "1",
              "-webkit-box-orient": "vertical",
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
