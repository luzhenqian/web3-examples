import {
  Alert,
  Button,
  Card,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  useDisclosure,
  useModal,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useContract,
  useContractEvent,
  useContractInfiniteReads,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useSigner,
  useWaitForTransaction,
} from "wagmi";
import { abi } from "../abi/NoahNFT.json";
import Profile from "../components/Profile";
import { Formik, Field } from "formik";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";
import useSWR from "swr";
import { CreatorRequest, NoahNFT as INoahNFT } from "@prisma/client";
import dayjs from "dayjs";
import dynamic from "next/dynamic";

const noahNFTcontract = {
  address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
  abi,
};

export default function NoahNFT() {
  const { data: signer } = useSigner();

  const contractInstance = useContract({
    ...noahNFTcontract,
    signerOrProvider: signer,
  });

  const [isMinter, setIsMinter] = useState(false);
  const { address } = useAccount();
  const { data, isLoading, error } = useSWR(`/api/nft/creator/${address}`);

  useEffect(() => {
    if (data && !error) {
      setIsMinter(true);
    }
  }, [data, error]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <Profile></Profile>
      <Heading>Noah NFT</Heading>
      {isMinter ? <Create /> : <CreatorRequest />}
      {address && <NFTList />}
    </div>
  );
}

// 请求成为创作者
function CreatorRequest() {
  const { address } = useAccount();
  const [isRequesting, setIsRequesting] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const createRequest = async (values: {
    name: string;
    email: string;
    reason: string;
  }) => {
    setIsRequesting(true);
    try {
      const res = await axios.post("/api/nft/creator/request", {
        ...values,
        address,
      });
      if (res.status === 200) {
        toast({
          title: "申请成功",
          description: "我们会尽快处理您的申请",
          status: "success",
        });
      }
    } catch (e: any) {
      console.log(e, "e");
      let description = "请稍后再试";
      if (e.response.status === 400) {
        description = e.response.data.message;
      }
      toast({
        title: "申请失败",
        description,
        status: "error",
      });
    } finally {
      setIsRequesting(false);
      onClose();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <Heading></Heading>
          <ModalHeader>申请成为创作者</ModalHeader>
          <ModalCloseButton />

          <Formik
            initialValues={{
              name: "",
              email: "",
              reason: "",
            }}
            onSubmit={createRequest}
          >
            {({ handleSubmit, errors, touched, values }) => {
              return (
                <form>
                  <ModalBody>
                    <FormControl isInvalid={!!errors.name && touched.name}>
                      <FormLabel htmlFor="name">名称</FormLabel>
                      <Field
                        name="name"
                        id="name"
                        type="text"
                        placeholder="怎么称呼您？"
                        as={Input}
                      ></Field>
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.name && touched.name}>
                      <FormLabel htmlFor="email">邮箱</FormLabel>
                      <Field
                        name="email"
                        id="email"
                        type="email"
                        placeholder="怎么联系您？"
                        as={Input}
                      ></Field>
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.reason && touched.reason}>
                      <FormLabel htmlFor="reason">申请原因</FormLabel>
                      <Field
                        name="reason"
                        id="reason"
                        type="text"
                        placeholder="您为什么要申请成为创作者？"
                        as={Textarea}
                      ></Field>
                      <FormErrorMessage>{errors.reason}</FormErrorMessage>
                    </FormControl>
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      colorScheme="purple"
                      width="full"
                      disabled={isRequesting}
                      isLoading={isRequesting}
                      onClick={() => handleSubmit()}
                    >
                      发送申请
                    </Button>
                  </ModalFooter>
                </form>
              );
            }}
          </Formik>
        </ModalContent>
      </Modal>

      <Alert>
        <div className="flex items-center justify-between gap-4">
          <div>
            <span>您还不是创作者？</span>
            <Button variant={"link"} title="申请成为创作者" onClick={onOpen}>
              申请成为创作者
            </Button>
          </div>

          <CreatorRequestList />
        </div>
      </Alert>
    </div>
  );
}

// 申请记录
function CreatorRequestList() {
  const { address } = useAccount();
  const { data, isLoading } = useSWR<CreatorRequest[]>(
    address ? `/api/nft/creator/request/${address}` : null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <div>
      <Button bg={"pink.600"} color={"white"} onClick={onOpen} size="sm">
        我的申请记录
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>申请记录</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading && <Spinner />}
            {!isLoading && data?.length === 0 && (
              <Alert status="info">暂无申请记录</Alert>
            )}
            <List spacing={3} className="my-2">
              {data?.map((item) => {
                return (
                  <ListItem key={item.id}>
                    <div className="flex items-center gap-4">
                      <span>
                        申请时间：{dayjs(item.createdAt).format("YYYY-MM-DD")}
                      </span>
                      <span>申请状态：{item.status}</span>
                    </div>
                  </ListItem>
                );
              })}
            </List>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

// Mint
function Mint() {
  return (
    <div>
      <Button>Mint</Button>
    </div>
  );
}

// 制作 NFT
function Create() {
  const { address } = useAccount();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createNFT = async (values: {
    name: string;
    description: string;
    image: string;
    attributes: { [key: string]: string | number | boolean }[];
    external_uri: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/upload/json", values);
      await axios.post("/api/nft", {
        creator: address,
        metadataUri: res.data.uri,
      });
      toast({
        title: "NFT 上传成功",
        description: "您的 NFT 已经上传成功",
        status: "success",
      });
      onClose();
    } catch (e) {
      toast({
        title: "NFT 上传失败",
        description: "您的 NFT 上传失败",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <div>
      <Button onClick={onOpen} bg={"pink.600"} color={"white"}>
        制作 NFT
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>制作 NFT</ModalHeader>
          <ModalBody>
            <Formik
              initialValues={{
                name: "",
                description: "",
                image: "",
                attributes: [],
                external_uri: "",
              }}
              onSubmit={(values) => {
                createNFT(values);
              }}
            >
              {({ handleSubmit, errors, touched, values }) => (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <FormControl isInvalid={!!errors.name && touched.name}>
                    <FormLabel htmlFor="name">名称</FormLabel>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      type="text"
                      variant="filled"
                      validate={(value: string) => {
                        let error;
                        if (value.length === 0 || value.length > 128) {
                          error = "名称长度必须大于 0 且小于 128";
                        }
                        return error;
                      }}
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={!!errors.description && touched.description}
                  >
                    <FormLabel htmlFor="description">描述</FormLabel>
                    <Field
                      as={Textarea}
                      id="description"
                      name="description"
                      type="text"
                      variant="filled"
                      validate={(value: string) => {
                        let error;
                        if (value.length === 0 || value.length > 1024) {
                          error = "描述长度必须大于 0 且小于 1024";
                        }
                        return error;
                      }}
                    />
                    <FormErrorMessage>{errors.description}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.image && touched.image}>
                    <FormLabel htmlFor="image">图片</FormLabel>
                    <Field
                      as={UploadImage}
                      id="image"
                      name="image"
                      variant="filled"
                      onUpload={(data: any) => {
                        values.image = data;
                      }}
                    />
                  </FormControl>

                  <FormControl
                    isInvalid={!!errors.external_uri && touched.external_uri}
                  >
                    <FormLabel htmlFor="external_uri">外部链接</FormLabel>
                    <Field
                      as={Input}
                      id="external_uri"
                      name="external_uri"
                      type="text"
                      variant="filled"
                      validate={(value: string) => {
                        let error;
                        if (value === "") {
                          return error;
                        }
                        if (value.length === 0 || value.length > 1024) {
                          error = "外部长度必须大于 0 且小于 1024";
                        }
                        return error;
                      }}
                    />
                    <FormErrorMessage>{errors.external_uri}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="purple"
                    width="full"
                    disabled={isLoading}
                    isLoading={isLoading}
                  >
                    制作 NFT
                  </Button>
                </form>
              )}
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

const NFTList = dynamic(() => Promise.resolve(_NFTList), {
  ssr: false,
});

// NFT 列表
function _NFTList() {
  if (typeof window === "undefined") return null;
  return (
    <div className="flex flex-col gap-2">
      <Tabs>
        <TabList>
          <Tab>我的 NFT</Tab>
          <Tab>全部 NFT</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MyNFTList />
          </TabPanel>
          <TabPanel>
            <AllNFTList />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

// 我的 NFT 列表
function MyNFTList() {
  const { address } = useAccount();
  const { data, error, isLoading } = useSWR<INoahNFT[]>(`/api/nft/${address}`);

  const contracts = (data || []).map((nft: INoahNFT) => {
    return {
      ...noahNFTcontract,
      functionName: "tokenURI",
      args: [nft.tokenId],
    };
  });

  const [metadatas, setMetadatas] = useState<any[]>([]);

  const { data: nftUris, isLoading: isReadsLoading } = useContractReads({
    // FIXME:
    // @ts-ignore
    contracts,
    enabled: data && data.length > 0 && !isLoading && !error,
  }) as any;

  useEffect(() => {
    (async () => {
      if (isReadsLoading) {
        return;
      }
      if (nftUris && data) {
        const metadataPromise = nftUris.map(async (uri: string) => {
          return await (await fetch(uri)).json();
        });
        const metadatas = await Promise.all(metadataPromise);
        setMetadatas(metadatas);
      }
    })();
  }, [isReadsLoading, nftUris, data]);

  if (typeof window === "undefined") return null;

  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Spinner />}
      {error && <div>加载失败</div>}
      <div className="grid grid-cols-4 gap-4 md:grid-cols-6">
        {data &&
          metadatas &&
          data.map(({ id, tokenId, createdAt }: INoahNFT, idx: number) => {
            const {
              name = "",
              description = "",
              image = { uri: "" },
              external_uri = "",
            } = metadatas?.[idx] || {};

            return (
              <Card key={id} className="flex flex-col items-center p-4">
                <Image src={image.uri} alt={name} width="200" height={"200"} />
                <div>
                  <div>名称：{name}</div>
                  <div>描述：{description}</div>
                  <div>
                    外部链接：
                    <a href={external_uri} target="_blank" rel="noreferrer">
                      {external_uri}
                    </a>
                  </div>
                  {/* <div>属性：{JSON.stringify(item.attributes)}</div> */}
                  <div>Token ID：{tokenId}</div>
                  <div>创建时间：{dayjs(createdAt).format("YYYY-MM-DD")}</div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

// 全部 NFT 列表
function AllNFTList() {
  const { data, isLoading, error } = useSWR("/api/nft");

  const [metadatas, setMetadatas] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      if (isLoading) {
        return;
      }
      if (data) {
        const metadataPromise = data.map(async ({ metadataUri }: INoahNFT) => {
          return await (await fetch(metadataUri)).json();
        });
        const metadatas = await Promise.all(metadataPromise);
        setMetadatas(metadatas);
      }
    })();
  }, [data, isLoading]);
  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Spinner />}
      {error && <div>加载失败</div>}
      <div className="grid grid-cols-4 gap-4 md:grid-cols-6">
        {data &&
          metadatas &&
          data.map(({ id, createdAt }: INoahNFT, idx: number) => {
            const {
              name = "",
              description = "",
              image = { uri: "" },
              external_uri = "",
            } = metadatas?.[idx] || {};

            return (
              <Card key={id} className="flex flex-col items-center p-4">
                <Image src={image.uri} alt={name} width="200" height={"200"} />
                <div>
                  <div>名称：{name}</div>
                  <div>描述：{description}</div>
                  <div>
                    外部链接：
                    <a href={external_uri} target="_blank" rel="noreferrer">
                      {external_uri}
                    </a>
                  </div>
                  {/* <div>属性：{JSON.stringify(item.attributes)}</div> */}
                  <div>创建时间：{dayjs(createdAt).format("YYYY-MM-DD")}</div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

function UploadImage({ onUpload }: { onUpload: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [process, setProcess] = useState(0);

  const check = async (file: File) => {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        if (image.width !== image.height) {
          reject("图片比例必须是 1:1");
          return;
        }
        resolve(true);
      };
    });
  };

  const toast = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      (async () => {
        const file = acceptedFiles[0];
        try {
          await check(file);
        } catch (e) {
          toast({
            title: "图片比例必须是 1:1",
            status: "error",
          });
          return;
        }
        setFile(file);
        const formData = new FormData();
        formData.append("file", file);
        axios
          .post("/api/upload/image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              setProcess(progressEvent.loaded / progressEvent.total!);
            },
          })
          .then((res) => {
            onUpload(res.data);
          });
      })();
    },
    [onUpload, toast]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 1024 * 1024,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });
  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className="flex justify-center p-4 border-2 border-gray-300 border-dashed rounded-sm cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>拖拽文件到这里</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImageUploadIcon />
            <p>拖拽文件到这里，或者点击上传文件</p>
            <p>支持的文件格式：.png, .jpg, .jpeg</p>
            <p>比例：1:1</p>
          </div>
        )}
      </div>

      {file && (
        <div
          className={`${
            process === 1 ? "bg-gray-50" : "bg-gray-400"
          } flex justify-between items-center py-2 px-4`}
        >
          <Image
            src={URL.createObjectURL(file)}
            alt={file.name}
            width="100"
            height={"100"}
          />
          {process === 1 ? (
            <OkIcon className="fill-green-600" />
          ) : (
            <LoadingIcon />
          )}
        </div>
      )}
    </div>
  );
}

function ImageUploadIcon({ w = 2, h = 2 }: { w?: number; h?: number }) {
  return (
    <svg
      style={{ width: `${w}rem`, height: `${h}rem` }}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="1937"
      width="200"
      height="200"
    >
      <path
        d="M853.344 341.344C853.344 294.4 814.944 256 768 256s-85.344 38.4-85.344 85.344 38.4 85.344 85.344 85.344 85.344-38.4 85.344-85.344z"
        p-id="1938"
      ></path>
      <path
        d="M0 85.344v853.344h512v-85.344H85.344V742.4l256-256L512 657.056l59.744-59.744-230.4-230.4-256 256V170.656h853.344v298.656l85.344 85.344V85.312z"
        p-id="1939"
      ></path>
      <path
        d="M951.456 840.544L1011.2 780.8l-200.544-200.544-200.544 200.544 59.744 59.744L768 742.4v238.944h85.344V742.4z"
        p-id="1940"
      ></path>
    </svg>
  );
}

function LoadingIcon({ w = 2, h = 2 }: { w?: number; h?: number }) {
  return (
    <svg
      className="animate-spin"
      style={{ width: `${w}rem`, height: `${h}rem` }}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2914"
      width="200"
      height="200"
    >
      <path
        d="M512 907c-24.852 0-45-20.148-45-45s20.148-45 45-45c168.446 0 305-136.554 305-305S680.446 207 512 207 207 343.554 207 512c0 24.852-20.148 45-45 45S117 536.852 117 512c0-218.152 176.848-395 395-395S907 293.848 907 512 730.152 907 512 907z"
        p-id="2915"
      ></path>
    </svg>
  );
}

function OkIcon({
  w = 2,
  h = 2,
  className = "",
}: {
  w?: number;
  h?: number;
  className?: string;
}) {
  return (
    <svg
      style={{ width: `${w}rem`, height: `${h}rem` }}
      className={className}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="3830"
      width="200"
      height="200"
    >
      <path
        d="M886.745 249.567c-12.864-12.064-33.152-11.488-45.217 1.408L414.776 705.344l-233.12-229.696c-12.608-12.416-32.864-12.288-45.28 0.32-12.416 12.575-12.256 32.863 0.352 45.248l256.48 252.672c0.096 0.096 0.224 0.128 0.319 0.224 0.097 0.096 0.129 0.224 0.225 0.32 2.016 1.92 4.448 3.008 6.784 4.288 1.151 0.672 2.144 1.664 3.359 2.144 3.776 1.472 7.776 2.24 11.744 2.24 4.192 0 8.384-0.832 12.288-2.496 1.313-0.544 2.336-1.664 3.552-2.368 2.4-1.408 4.896-2.592 6.944-4.672 0.096-0.096 0.128-0.256 0.224-0.352 0.064-0.097 0.192-0.129 0.288-0.225l449.185-478.208C900.28 281.951 899.608 261.695 886.745 249.567z"
        p-id="3831"
      ></path>
    </svg>
  );
}
