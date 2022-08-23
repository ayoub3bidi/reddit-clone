import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

const ChangePassword: NextPage<{ token: string }> = () => {
    const router = useRouter();
    // console.log(router.query)
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");
    return (
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({ newPassword: values.newPassword, token: typeof router.query.token === "string" ? router.query.token : "" });
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              // worked
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* token is: {token} */}
              <InputField
                name="newPassword"
                placeholder="New password"
                label="New Password"
                type="password"
              />
              {tokenError ? (
                <Flex mb={2}>
                  <Text fontSize="md" mr={2} color="red">{tokenError}</Text>
                  <NextLink href="/forgot-password"><Link>Click here to get a new one</Link></NextLink>
                </Flex>
              ) : null}
              <Button type="submit" isLoading={isSubmitting} bg='#FF4500'>Change Password</Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient) (ChangePassword)