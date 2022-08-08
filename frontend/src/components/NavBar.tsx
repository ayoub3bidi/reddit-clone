import NextLink from "next/link";
import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { useMeQuery } from "../generated/graphql";
import { DarkModeSwitch } from "./DarkModeSwitch";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  // * data is loading
  if (fetching) {
    body = null
  }
 // * user not logged in
    else if (!data?.me) {
        body = (
            <>
                <Button mr={2}>
                    <NextLink href="/register">Register</NextLink>
                </Button>
                <Button>
                    <NextLink href="/login">Login</NextLink>
                </Button>
            </>
        );
    }
// * user is logged in
  else {
        body = (
        <Flex align="center">
            <Box mr={2}>You logged in as <b>{data.me.username}</b> </Box>
            <Button ml={5}>Logout</Button>
        </Flex>
        );
    }

  return (
    <Flex zIndex={1} position="sticky" top={0} p={4}>
        <NextLink href="/">
            <Heading>Reddit Clone</Heading>
        </NextLink>
      <Flex flex={1} m="auto" align="center" maxW={1000}>
            <Box ml={"auto"}>{body}</Box>
      </Flex>
      <DarkModeSwitch/>
    </Flex>
  );
}