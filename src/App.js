import { ThemeProvider } from "@mui/material/styles";
import "./styles.css";
import AppBar from "./AppBar";
import Content from "./Content";
import Drawer from "./Drawer";
import theme from "./Theme";

export default function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <AppBar />
        <Drawer />
        <Content />
      </ThemeProvider>
    </div>
  );
}
