import NextLink from "next/link";
import { Box, Button, Flex, Heading, Image, Stack } from "@chakra-ui/react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { DarkModeSwitch } from "./DarkModeSwitch";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{fetching: logoutFetching}, logout] = useLogoutMutation()
  const [{ data, fetching }] = useMeQuery({
    // pause: isServer() // ! isServer function causes hydration problem
  });
  let body = null;

  // * data is loading
  if (fetching) {
    body = null
  }
 // * user not logged in
    else if (!data?.me) {
        body = (
            <>
                <NextLink href="/register">
                  <Button mr={2}>
                      Register
                  </Button>
                </NextLink>
                <NextLink href="/login">
                  <Button mr={2}>
                      Login
                  </Button>
                </NextLink>
            </>
        );
    }
// * user is logged in
  else {
        body = (
        <Flex align="center">
            <Box mr={2} color="#FF8b60">You logged in as <b>{data.me.username}</b> </Box>
            <NextLink href="/create-post"><Button ml={5}>Create Post</Button></NextLink>
            <Button ml={5} onClick={() => { logout() }} isLoading={logoutFetching}>Logout</Button>
        </Flex>
        );
    }

  return (
    <Flex zIndex={1} position="sticky" bg="#2D3748" top={0} p={4}>
        <NextLink href="/">
          <Stack direction="row">
            <Box>
              <Image boxSize="45px" src='https://i.ibb.co/DpT4sQx/logo.png' alt='Dan Abramov' />
            </Box>
            <Heading color="#FF8b60">Reddit Clone</Heading>
          </Stack>
        </NextLink>
        <Flex flex={1} m="auto" align="center" maxW={1000}>
              <Box ml={"auto"}>{body}</Box>
        </Flex>
        <DarkModeSwitch/>
    </Flex>
  );
}