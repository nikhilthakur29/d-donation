/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { getETHPrice, getWEIPriceInUSD } from '../../../../lib/getETHPrice';
import {
  Heading,
  useBreakpointValue,
  useColorModeValue,
  Text,
  Button,
  Flex,
  Container,
  SimpleGrid,
  Box,
  Spacer,
  Table,
  Thead,
  Tbody,
  Tooltip,
  Tr,
  Th,
  Td,
  TableCaption,
  Skeleton,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  Stack,
  Link,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
} from '@chakra-ui/icons';

import { ethers } from 'ethers';
import Campaign from '../../../../smart-contracts/artifacts/contracts/Campaigns.sol/Campaign.json';
import { AccountContext } from '../../../../context/AccountContext';

export async function getServerSideProps({ params }) {
  let provider;
  if (process.env.ENVIRONMENT === 'local') {
    provider = new ethers.providers.JsonRpcProvider();
  } else if (process.env.ENVIRONMENT === 'testnet') {
    provider = new ethers.providers.JsonRpcProvider(
      `https://polygon-mumbai.infura.io/v3/500553bcf26f4de1880333dfcce56107`
    );
  }

  const campaignId = params.id;

  const campaign = new ethers.Contract(campaignId, Campaign.abi, provider);

  const requestCount = await campaign.requestsCount();
  const contributorsCount = await campaign.contributorsCount();
  const summary = await campaign.getSummary();

  const ETHPrice = await getETHPrice();

  return {
    props: {
      campaignId,
      requestCount: parseInt(requestCount),
      contributorsCount: parseInt(contributorsCount),
      balance: ethers.utils.formatUnits(summary[1], 'ether'),
      name: summary[5],
      ETHPrice,
    },
  };
}

const RequestRow = ({
  id,
  request,
  contributorsCount,
  campaignId,
  disabled,
  ETHPrice,
}) => {
  const router = useRouter();

  const { currentProvider } = useContext(AccountContext);

  const readyToFinalize = parseInt(request.votersCount) > contributorsCount / 2;
  const [errorMessageApprove, setErrorMessageApprove] = useState();
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [errorMessageFinalize, setErrorMessageFinalize] = useState();
  const [loadingFinalize, setLoadingFinalize] = useState(false);

  const onApprove = async () => {
    setLoadingApprove(true);
    if (typeof window.ethereum !== 'undefined') {
      const signer = currentProvider.getSigner();

      const campaign = new ethers.Contract(campaignId, Campaign.abi, signer);

      try {
        const votedRequest = await campaign.voteRequest(id);
        await currentProvider.waitForTransaction(votedRequest.hash)
        router.reload();
      } catch (err) {
        const newError = err.data ? err.data.message : err.message;
        console.log(newError);
        setErrorMessageApprove(newError);
      } finally {
        setLoadingApprove(false);
      }
    }
  };

  const onFinalize = async () => {
    setLoadingFinalize(true);
    if (typeof window.ethereum !== 'undefined') {
      const signer = currentProvider.getSigner();

      const campaign = new ethers.Contract(campaignId, Campaign.abi, signer);

      try {
        const finalizedRequest = await campaign.finalizeRequest(id);
        await currentProvider.waitForTransaction(finalizedRequest.hash)
        router.reload();
      } catch (err) {
        const newError = err.data ? err.data.message : err.message;
        console.log(newError);
        setErrorMessageFinalize(newError);
      } finally {
        setLoadingFinalize(false);
      }
    }
  };

  return (
    <Tr
      bg={
        readyToFinalize && !request.completed
          ? useColorModeValue('teal.100', 'teal.700')
          : useColorModeValue('gray.100', 'gray.700')
      }
      opacity={request.completed ? '0.4' : '1'}
    >
      <Td>{id} </Td>
      <Td>{request.description}</Td>
      <Td isNumeric>
        {ethers.utils.formatEther(request.value, 'ether')} MATIC ($
        {getWEIPriceInUSD(ETHPrice, request.value)})
      </Td>
      <Td>
        <Link
          color='teal.500'
          href={`https://mumbai.polygonscan.com/address/${request.recipient}`}
          isExternal
        >
          {request.recipient.substr(0, 10) + '...'}
        </Link>
      </Td>
      <Td>
        {parseInt(request.votersCount)}/{contributorsCount}
      </Td>
      <Td>
        <HStack spacing={2}>
          <Tooltip
            label={errorMessageApprove}
            bg={useColorModeValue('white', 'gray.700')}
            placement={'top'}
            color={useColorModeValue('gray.800', 'white')}
            fontSize={'1em'}
          >
            <WarningIcon
              color={useColorModeValue('red.600', 'red.300')}
              display={errorMessageApprove ? 'inline-block' : 'none'}
            />
          </Tooltip>
          {request.completed ? (
            <Tooltip
              label='This Request has been finalized & withdrawn to the recipient,it may then have less no of approvers'
              bg={useColorModeValue('white', 'gray.700')}
              placement={'top'}
              color={useColorModeValue('gray.800', 'white')}
              fontSize={'1em'}
            >
              <CheckCircleIcon
                color={useColorModeValue('green.600', 'green.300')}
              />
            </Tooltip>
          ) : (
            <Button
              colorScheme='yellow'
              variant='outline'
              _hover={{
                bg: 'yellow.600',
                color: 'white',
              }}
              onClick={onApprove}
              isDisabled={
                disabled || parseInt(request.votersCount) === contributorsCount
              }
              isLoading={loadingApprove}
            >
              Approve
            </Button>
          )}
        </HStack>
      </Td>
      <Td>
        <Tooltip
          label={errorMessageFinalize}
          bg={useColorModeValue('white', 'gray.700')}
          placement={'top'}
          color={useColorModeValue('gray.800', 'white')}
          fontSize={'1em'}
        >
          <WarningIcon
            color={useColorModeValue('red.600', 'red.300')}
            display={errorMessageFinalize ? 'inline-block' : 'none'}
            mr='2'
          />
        </Tooltip>
        {request.completed ? (
          <Tooltip
            label='This Request has been finalized & withdrawn to the recipient,it may then have less no of approvers'
            bg={useColorModeValue('white', 'gray.700')}
            placement={'top'}
            color={useColorModeValue('gray.800', 'white')}
            fontSize={'1em'}
          >
            <CheckCircleIcon
              color={useColorModeValue('green.600', 'green.300')}
            />
          </Tooltip>
        ) : (
          <HStack spacing={2}>
            <Button
              colorScheme='green'
              variant='outline'
              _hover={{
                bg: 'green.600',
                color: 'white',
              }}
              isDisabled={disabled || (!request.completed && !readyToFinalize)}
              onClick={onFinalize}
              isLoading={loadingFinalize}
            >
              Finalize
            </Button>

            <Tooltip
              label='This Request is ready to be Finalized because it has been approved by 50% Approvers'
              bg={useColorModeValue('white', 'gray.700')}
              placement={'top'}
              color={useColorModeValue('gray.800', 'white')}
              fontSize={'1.2em'}
            >
              <InfoIcon
                as='span'
                color={useColorModeValue('teal.800', 'white')}
                display={
                  (readyToFinalize && !request.completed)
                    ? 'inline-block'
                    : 'none'
                }
              />
            </Tooltip>
          </HStack>
        )}
      </Td>
    </Tr>
  );
};

export default function Requests({
  campaignId,
  requestCount,
  contributorsCount,
  balance,
  name,
  ETHPrice,
}) {
  const [requestsList, setRequestsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [FundNotAvailable, setFundNotAvailable] = useState(false);
  const {currentProvider} = useContext(AccountContext);

  const campaign = new ethers.Contract(campaignId, Campaign.abi, currentProvider);
  async function getRequests() {
    try {
      const requests = await Promise.all(
        Array(parseInt(requestCount))
          .fill()
          .map((_element, index) => {

            return campaign.requests(index);
          })
      );
      setRequestsList(requests);
      setIsLoading(false);
      return requests;
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (balance == 0) {
      setFundNotAvailable(true);
    }
    getRequests();
  }, [currentProvider]);

  return (
    <div>
      <Head>
        <title>Campaign Withdrawal Requests</title>
        <meta name='description' content='Create a Withdrawal Request' />
        <link rel='icon' href='/logo.svg' />
      </Head>

      <main>
        <Container px={{ base: '4', md: '12' }} maxW={'7xl'} align={'left'}>
          <Flex flexDirection={{ base: 'column', md: 'row' }} py={4}>
            <Box py='4'>
              <Text fontSize={'lg'} color={'teal.400'}>
                <ArrowBackIcon mr={2} />
                <NextLink href={`/campaign/${campaignId}`}>
                  Back to Campaign
                </NextLink>
              </Text>
            </Box>
            <Spacer />
            <Box py='4'>
              Campaign Balance :{' '}
              <Text as='span' fontWeight={'bold'} fontSize='lg'>
                {balance > 0 ? balance : '0, Become a Donor 😄'}
              </Text>
              <Text
                as='span'
                display={balance > 0 ? 'inline' : 'none'}
                pr={2}
                fontWeight={'bold'}
                fontSize='lg'
              >
                {' '}
                MATIC
              </Text>
              <Text
                as='span'
                display={balance > 0 ? 'inline' : 'none'}
                fontWeight={'normal'}
                color={useColorModeValue('gray.500', 'gray.200')}
              >
                (${getWEIPriceInUSD(ETHPrice, balance)})
              </Text>
            </Box>
          </Flex>
          {FundNotAvailable ? (
            <Alert status='error' my={4}>
              <AlertIcon />
              <AlertDescription>
                The Current Balance of the Campaign is 0, Please Contribute to
                approve and finalize Requests.
              </AlertDescription>
            </Alert>
          ) : null}
        </Container>
        {requestsList.length > 0 ? (
          <Container px={{ base: '4', md: '12' }} maxW={'7xl'} align={'left'}>
            <Flex flexDirection={{ base: 'column', lg: 'row' }} py={4}>
              <Box py='2' pr='2'>
                <Heading
                  textAlign={useBreakpointValue({ base: 'left' })}
                  fontFamily={'heading'}
                  color={useColorModeValue('gray.800', 'white')}
                  as='h3'
                  isTruncated
                  maxW={'3xl'}
                >
                  Withdrawal Requests for {name} Campaign
                </Heading>
              </Box>
              <Spacer />
              <Box py='2'>
                <NextLink href={`/campaign/${campaignId}/requests/new`}>
                  <Button
                    display={{ sm: 'inline-flex' }}
                    justify={'flex-end'}
                    fontSize={'md'}
                    fontWeight={600}
                    color={'white'}
                    bg={'teal.400'}
                    href={'#'}
                    _hover={{
                      bg: 'teal.300',
                    }}
                  >
                    Add Withdrawal Request
                  </Button>
                </NextLink>
              </Box>
            </Flex>{' '}
            <Box overflowX='auto'>
              <Table>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th w='30%'>Description</Th>
                    <Th isNumeric>Amount</Th>
                    <Th maxW='12%' isTruncated>
                      Recipient Wallet Address
                    </Th>
                    <Th>Approved / Contributors </Th>
                    <Th>Approve </Th>
                    <Th>Finalize </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requestsList.map((request, index) => {
                    return (
                      <RequestRow
                        key={index}
                        id={index}
                        request={request}
                        contributorsCount={contributorsCount}
                        campaignId={campaignId}
                        disabled={FundNotAvailable}
                        ETHPrice={ETHPrice}
                      />
                    );
                  })}
                </Tbody>
                <TableCaption textAlign='left' ml='-2'>
                  Found {requestCount} Requests
                </TableCaption>
              </Table>
            </Box>
          </Container>
        ) : (
          <div>
            <Container
              px={{ base: '4', md: '12' }}
              maxW={'7xl'}
              align={'left'}
              display={isLoading ? 'block' : 'none'}
            >
              <SimpleGrid rows={{ base: 3 }} spacing={2}>
                <Skeleton height='2rem' />
                <Skeleton height='5rem' />
                <Skeleton height='5rem' />
                <Skeleton height='5rem' />
              </SimpleGrid>
            </Container>
            <Container
              maxW={'lg'}
              align={'center'}
              display={
                requestsList.length === 0 && !isLoading ? 'block' : 'none'
              }
            >
              <SimpleGrid row spacing={2} align='center'>
                <Stack align='center'>
                  <NextImage
                    src='/static/no-requests.png'
                    alt='no-request'
                    width='150'
                    height='150'
                  />
                </Stack>
                <Heading
                  textAlign={'center'}
                  color={useColorModeValue('gray.800', 'white')}
                  as='h4'
                  size='md'
                >
                  No Requests yet for {name} Campaign
                </Heading>
                <Text
                  textAlign={useBreakpointValue({ base: 'center' })}
                  color={useColorModeValue('gray.600', 'gray.300')}
                  fontSize='sm'
                >
                  Create a Withdrawal Request to Withdraw funds from the
                  Campaign😄
                </Text>

                <Button
                  fontSize={'md'}
                  fontWeight={600}
                  color={'white'}
                  bg={'teal.400'}
                  _hover={{
                    bg: 'teal.300',
                  }}
                  disabled={FundNotAvailable}
                >
                  <NextLink href={`/campaign/${campaignId}/requests/new`}>
                    Create Withdrawal Request
                  </NextLink>
                </Button>

                <Button
                  fontSize={'md'}
                  fontWeight={600}
                  color={'white'}
                  bg={'gray.400'}
                  _hover={{
                    bg: 'gray.300',
                  }}
                >
                  <NextLink href={`/campaign/${campaignId}/`}>
                    Go to Campaign
                  </NextLink>
                </Button>
              </SimpleGrid>
            </Container>
          </div>
        )}
      </main>
    </div>
  );
}
