import React, { useContext, useState } from 'react';
import Head from 'next/head';
import { useAsync } from 'react-use';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import {
  Flex,
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
  FormHelperText,
  Textarea,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getETHPrice, getETHPriceInUSD } from '../../lib/getETHPrice';

import { ethers } from 'ethers';
import { AccountContext } from '../../context/AccountContext';

import { contractAddress } from '../../smart-contracts/config';
import CampaignFactory from '../../smart-contracts/artifacts/contracts/Campaigns.sol/CampaignFactory.json';

export default function NewCampaign() {
  const { currentAccount, connect, currentProvider } = useContext(AccountContext);

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: 'onChange',
  });
  const router = useRouter();
  const [error, setError] = useState('');
  const [minContriInUSD, setMinContriInUSD] = useState();
  const [targetInUSD, setTargetInUSD] = useState();
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
    setError('')    
    if (typeof window.ethereum !== 'undefined') {
      const signer = currentProvider.getSigner();

      const contract = new ethers.Contract(
        contractAddress,
        CampaignFactory.abi,
        signer
      );

      try {
        const createdCampaign = await contract.createCampaign(
          ethers.utils.parseEther(data.minimumContribution),
          data.campaignName,
          data.description,
          data.imageUrl,
          ethers.utils.parseEther(data.target),
          data.managerName
        );
        await currentProvider.waitForTransaction(createdCampaign.hash)  
        router.push('/');
      } catch (err) {
        setError(err.message);
        console.log(err);
      }
    }
  }

  return (
    <div>
      <Head>
        <title>New Campaign</title>
        <meta name='description' content='Create New Campaign' />
        <link rel='icon' href='/logo.svg' />
      </Head>
      <main>
        <Stack spacing={8} mx={'auto'} maxW={'2xl'} py={12} px={6}>
          <Text fontSize={'lg'} color={'teal.400'}>
            <ArrowBackIcon mr={2} />
            <NextLink href='/'> Back to Home</NextLink>
          </Text>
          <Stack>
            <Heading fontSize={'4xl'}>Create a New Campaign 📢</Heading>
          </Stack>
          <Box
            rounded={'lg'}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow={'lg'}
            p={8}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl id='managerName'>
                  <FormLabel>Manager Name</FormLabel>
                  <Input
                    {...register('managerName', { required: true })}
                    isDisabled={isSubmitting}
                    type='text'
                  />
                </FormControl>
                <FormControl id='minimumContribution'>
                  <FormLabel>Minimum Contribution Amount</FormLabel>
                  <InputGroup>
                    {' '}
                    <Input
                      type='number'
                      step='any'
                      {...register('minimumContribution', { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setMinContriInUSD(Math.abs(e.target.value));
                      }}
                    />{' '}
                    <InputRightAddon>MATIC</InputRightAddon>
                  </InputGroup>
                  {minContriInUSD ? (
                    <FormHelperText>
                      ~$ {getETHPriceInUSD(ETHPrice, minContriInUSD)}
                    </FormHelperText>
                  ) : null}
                </FormControl>
                <FormControl id='campaignName'>
                  <FormLabel>Campaign Name</FormLabel>
                  <Input
                    {...register('campaignName', { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                <FormControl id='description'>
                  <FormLabel>Campaign Description</FormLabel>
                  <Textarea
                    {...register('description', { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                <FormControl id='imageUrl'>
                  <FormLabel>Image URL</FormLabel>
                  <Input
                    {...register('imageUrl', { required: true })}
                    isDisabled={isSubmitting}
                    type='url'
                  />
                </FormControl>

                <FormControl id='target'>
                  <FormLabel>Target Amount</FormLabel>
                  <InputGroup>
                    <Input
                      type='number'
                      step='any'
                      {...register('target', { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setTargetInUSD(Math.abs(e.target.value));
                      }}
                    />
                    <InputRightAddon>MATIC</InputRightAddon>
                  </InputGroup>
                  {targetInUSD ? (
                    <FormHelperText>
                      ~$ {getETHPriceInUSD(ETHPrice, targetInUSD)}
                    </FormHelperText>
                  ) : null}
                </FormControl>

                {error ? (
                  <Alert status='error'>
                    <AlertIcon />
                    <AlertDescription mr={2}> {error}</AlertDescription>
                  </Alert>
                ) : null}
                {errors.minimumContribution ||
                errors.name ||
                errors.description ||
                errors.imageUrl ||
                errors.target ? (
                  <Alert status='error'>
                    <AlertIcon />
                    <AlertDescription mr={2}>
                      {' '}
                      All Fields are Required
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Stack spacing={10}>
                  {currentAccount ? (
                    <Button
                      bg={'teal.400'}
                      color={'white'}
                      _hover={{
                        bg: 'teal.500',
                      }}
                      isLoading={isSubmitting}
                      type='submit'
                    >
                      Create
                    </Button>
                  ) : (
                    <Stack spacing={3}>
                      <Button
                        color={'white'}
                        bg={'teal.400'}
                        _hover={{
                          bg: 'teal.300',
                        }}
                        onClick={() => connect()}
                      >
                        Connect Wallet{' '}
                      </Button>
                      <Alert status='warning'>
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
