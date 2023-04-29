import Navbar from "./Navbar";
import { Container } from "@mui/material";

export default function NavbarHOC(Component: () => JSX.Element | null) {
  return (
    <>
      <Navbar />

      <Container>
        <Component />
      </Container>
    </>
  );
}
