import { Center } from "@chakra-ui/react";
import AccountManager from "./components/AccountManager";
export default function Home() {
  return (
    <Center background={"rgba(0,0,0,0.25)"} width={"100vw"} height={"100vh"}>
      <AccountManager />
    </Center>


  );
}
