import {
  Box,
  Container,
  Link,
  Stack,
  Text,
  useColorModeValue,
  Heading,
  useBreakpointValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
    >
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        spacing={4}
        justify={'center'}
        align={'center'}
      >
        <Heading
          textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
          fontFamily={'heading'}
          color={useColorModeValue('teal.800', 'white')}
          as='h2'
          size='lg'
        >
          <Box
            as={'span'}
            color={useColorModeValue('teal.400', 'teal.300')}
            position={'relative'}
            zIndex={10}
            _after={{
              content: '""',
              position: 'absolute',
              left: 0,
              bottom: 0,
              w: 'full',
              h: '30%',
              bg: useColorModeValue('teal.100', 'teal.900'),
              zIndex: -1,
            }}
          >
            <NextLink href='/'>🪙 D-donation</NextLink>
          </Box>
        </Heading>
        <Stack direction={'row'} spacing={6}>
          <NextLink href='/'>Home</NextLink>
          <Link href={'https://github.com/'} isExternal>
            Github
          </Link>
          <Link href={''} isExternal>
            Contact
          </Link>
        </Stack>
      </Container>

      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text>
            🌐 Made by Nikhil Thakur, Shubham Joshi
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
