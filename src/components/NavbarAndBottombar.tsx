import Navbar from "./Navbar";
import BottomBar from "./Bottombar";
import { Container } from "@mui/material";

export default function NavbarAndBottombar(Component: () => JSX.Element | null) {
  return (
    <>
      <Navbar />

      <Container>
        <Component />
      </Container>

      <BottomBar />
    </>
  );
}
