import Head from "next/head";
import NextLink from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { getETHPrice, getETHPriceInUSD } from "../../../../lib/getETHPrice";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  InputRightAddon,
  InputGroup,
  Alert,
  AlertIcon,
  AlertDescription,
  FormErrorMessage,
  FormHelperText,
  Textarea,
} from "@chakra-ui/react";

import Campaign from '../../../../smart-contracts/artifacts/contracts/Campaigns.sol/Campaign.json'
import { useAsync } from "react-use";
import { AccountContext } from "../../../../context/AccountContext";
import { ethers } from "ethers";

export default function NewRequest() {
  const {currentAccount,connect, currentProvider} = useContext(AccountContext)
  const router = useRouter();
  const { id } = router.query;
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
  });
  const [error, setError] = useState("");
  const [inUSD, setInUSD] = useState();
  const [ETHPrice, setETHPrice] = useState(0);
  useAsync(async () => {
    try {
      const result = await getETHPrice();
      setETHPrice(result);
    } catch (err) {
      console.log(err);
    }
  }, []);
  async function onSubmit(data) {
    if (typeof window.ethereum !== 'undefined') {

      const signer = currentProvider.getSigner();

      const campaign = new ethers.Contract(
        id,
        Campaign.abi,
        signer
      );
      try {
        let balance = await campaign.getContractBalance()
        balance = parseFloat(ethers.utils.formatEther(balance));
        console.log(data.value, balance);
        if (data.value >= balance ) {
          throw new Error(`Request Amount must be smaller than contract balance`)
        }
        const createdRequest = await campaign.createRequest(
          data.description,
          data.recipient,
          ethers.utils.parseEther(data.value)
        )
        await currentProvider.waitForTransaction(createdRequest.hash)
        router.push(`/campaign/${id}/requests`);
      } catch (err) {
        
        const newError = err.data ? err.data.message : err.message
        setError(newError);
        console.log(newError);
      }
    }
    
    
  }

  return (
    <div>
      <Head>
        <title>Create a Withdrawal Request</title>
        <meta name="description" content="Create a Withdrawal Request" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <main>
        <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6}>
          <Text fontSize={"lg"} color={"teal.400"} justifyContent="center">
            <ArrowBackIcon mr={2} />
            <NextLink href={`/campaign/${id}/requests`}>
              Back to Requests
            </NextLink>
          </Text>
          <Stack>
            <Heading fontSize={"4xl"}>Create a Withdrawal Request 💸</Heading>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl id="description">
                  <FormLabel>Request Description</FormLabel>
                  <Textarea
                    {...register("description", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                <FormControl id="value">
                  <FormLabel>Amount in MATIC</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      {...register("value", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setInUSD(Math.abs(e.target.value));
                      }}
                      step="any"
                    />
                    <InputRightAddon>MATIC</InputRightAddon> 
                  </InputGroup>
                  {inUSD ? (
                    <FormHelperText>
                      ~$ {getETHPriceInUSD(ETHPrice, inUSD)}
                    </FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl id="recipient">
                  <FormLabel htmlFor="recipient">
                    Recipient Polygon Wallet Address
                  </FormLabel>
                  <Input
                    name="recipient"
                    {...register("recipient", {
                      required: true,
                    })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                {errors.description || errors.value || errors.recipient ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}>
                      {" "}
                      All Fields are Required
                    </AlertDescription>
                  </Alert>
                ) : null}
                {error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}> {error}</AlertDescription>
                  </Alert>
                ) : null}
                <Stack spacing={10}>
                  {currentAccount ? (
                    <Button
                      bg={"teal.400"}
                      color={"white"}
                      _hover={{
                        bg: "teal.500",
                      }}
                      isLoading={isSubmitting}
                      type="submit"
                    >
                      Create Withdrawal Request
                    </Button>
                  ) : (
                    <Stack spacing={3}>
                      <Button
                        color={"white"}
                        bg={"teal.400"}
                        _hover={{
                          bg: "teal.300",
                        }}
                        onClick={() => connect()}
                      >
                        Connect Wallet{" "}
                      </Button>
                      <Alert status="warning">
                        <AlertIcon />
                        <AlertDescription mr={2}>
                          Please Connect Your Wallet First to Create a Campaign
                        </AlertDescription>
                      </Alert>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </main>
    </div>
  );
}
