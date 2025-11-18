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
  useClipboard,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useContract, useSigner } from "wagmi";
import { abi } from "@/abi/NoahNFT.json";
import { Formik, Field, FieldArray } from "formik";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";
import useSWR from "swr";
import { CreatorRequest, NoahNFT as INoahNFT } from "@prisma/client";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { AddIcon, CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import { EventEmitter } from "events";

const eventBus = new EventEmitter();
const events = {
  NFT_CREATED: "NFT_CREATED",
};

const noahNFTcontract = {
  address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
  abi,
};

const _NoahNFT = dynamic(() => Promise.resolve(NoahNFT), { ssr: false });
// @ts-ignore
_NoahNFT.useWallet = true;
export default _NoahNFT;

function NoahNFT() {
  const { data: signer } = useSigner();

  const contractInstance = useContract({
    ...noahNFTcontract,
    signerOrProvider: signer,
  });

  const [isMinter, setIsMinter] = useState(false);
  const { address } = useAccount();
  const { data, isLoading, error } = useSWR(
    address ? `/api/nft/creator/${address}` : null
  );

  useEffect(() => {
    if (data && !error) {
      setIsMinter(true);
    }
    if (error) {
      console.log(error);
    }
  }, [data, error]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <Heading>Noah NFT</Heading>
      <Mint />
      {isMinter ? <Create /> : <CreatorRequest />}
      <NFTList />
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
      console.log(e);
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

  if (!address) {
    return <Alert status="info">需要先连接钱包才可以制作 NFT</Alert>;
  }

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
                        validate={(value: string) => {
                          if (!value) {
                            return "名称不能为空";
                          }
                          if (value.length > 20 || value.length <= 0) {
                            return "名称长度必须在 1-20 之间";
                          }
                        }}
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
                        validate={(value: string) => {
                          if (!value) {
                            return "邮箱不能为空";
                          }
                          if (value.length > 1024 || value.length <= 0) {
                            return "邮箱长度必须在 1-1024 之间";
                          }
                        }}
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
                        validate={(value: string) => {
                          if (!value) {
                            return "申请原因不能为空";
                          }
                          if (value.length > 1024 || value.length <= 0) {
                            return "申请原因长度必须在 1-1024 之间";
                          }
                        }}
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
  const toast = useToast();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { data: signer } = useSigner();
  const noahNFTcontractInstance = useContract({
    ...noahNFTcontract,
    signerOrProvider: signer,
  });

  const mint = async () => {
    try {
      setIsLoading(true);
      try {
        const token = (await axios.get("/api/nft/mint")).data;
        try {
          const { wait } = await noahNFTcontractInstance?.mint(
            address,
            token.metadataUri
          );
          const receipt = await wait();
          console.log(receipt);
          toast({
            title: "Mint 成功",
          });
          // 获取 tokenId
          const tokenId = receipt.events
            .find((event: any) => {
              return event.event === "Transfer";
            })
            .args.tokenId.toNumber();
          // 更新数据
          axios.put(`/api/nft/${token.id}`, {
            tokenId,
            owner: address,
          });
        } catch (e) {
          console.log(e);
          toast({
            title: "您已取消 Mint",
            status: "error",
          });
        }
      } catch (e) {
        toast({
          title: "Mint 失败",
          status: "error",
          description: "现在没有 NFT 可以 Mint",
        });
      } finally {
        setIsLoading(false);
      }
    } catch (e) {
      toast({
        title: "Mint 失败",
      });
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={mint}
        color="white"
        bg={"purple"}
        isLoading={isLoading}
        disabled={isLoading}
      >
        Mint
      </Button>
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
        name: values.name,
        description: values.description,
        image: values.image,
        attributes: values.attributes,
        external_uri: values.external_uri,
      });
      toast({
        title: "NFT 上传成功",
        description: "您的 NFT 已经上传成功",
        status: "success",
      });
      onClose();
      eventBus.emit(events.NFT_CREATED);
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
      {address ? (
        <Button onClick={onOpen} bg={"pink.600"} color={"white"}>
          制作 NFT
        </Button>
      ) : (
        <Alert status="info">需要先连接钱包才可以制作 NFT</Alert>
      )}

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
                attributes: [
                  {
                    trait_type: "",
                    value: "",
                  },
                ],
                external_uri: "",
              }}
              onSubmit={createNFT}
            >
              {({ handleSubmit, errors, touched, values, setValues }) => (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <FormControl isInvalid={!!errors.name && touched.name}>
                    <FormLabel htmlFor="name">名称</FormLabel>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      type="text"
                      variant="filled"
                      placeholder="NFT 的名称"
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
                      placeholder="对该 NFT 的描述"
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
                        // values.image = data;
                        setValues({
                          ...values,
                          image: data.uri,
                        });
                      }}
                      validate={(value: string) => {
                        let error;
                        if (value.length === 0) {
                          error = "必须上传图片";
                        }
                        return error;
                      }}
                    />
                    <FormErrorMessage>{errors.image}</FormErrorMessage>
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
                      placeholder="您在 Web2 中的网站链接"
                      validate={(value: string) => {
                        let error;
                        if (value.length === 0 || value.length > 1024) {
                          error = "外部长度必须大于 0 且小于 1024";
                        }
                        return error;
                      }}
                    />
                    <FormErrorMessage>{errors.external_uri}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FieldArray name="attributes">
                      {({ remove, push }) => (
                        <div>
                          <FormLabel
                            htmlFor={`attributes`}
                            className="!flex items-center justify-between w-full"
                          >
                            <span>属性</span>
                            <AddIcon
                              className="hover:text-purple-400"
                              onClick={() => {
                                push({
                                  trait_type: "",
                                  value: "",
                                });
                              }}
                            />
                          </FormLabel>
                          <div className="flex flex-col gap-2">
                            {values.attributes.map((attribute, index) => (
                              <div key={index}>
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <Field
                                      as={Input}
                                      id={`attributes.${index}.trait_type`}
                                      name={`attributes.${index}.trait_type`}
                                      type="text"
                                      variant="filled"
                                      placeholder="属性名"
                                      validate={(value: string) => {
                                        // TODO: error 无效
                                        let error;
                                        if (
                                          value &&
                                          (value.length === 0 ||
                                            value.length > 1024)
                                        ) {
                                          error = "长度必须大于 0 且小于 1024";
                                        }
                                        return error;
                                      }}
                                    />

                                    <FormErrorMessage>
                                      {errors.attributes &&
                                        /* @ts-ignore */
                                        errors.attributes[index] &&
                                        // @ts-ignore
                                        errors.attributes[index].trait_type}
                                    </FormErrorMessage>
                                  </div>

                                  <div>
                                    <Field
                                      as={Input}
                                      id={`attributes.${index}.value`}
                                      name={`attributes.${index}.value`}
                                      type="text"
                                      variant="filled"
                                      placeholder="属性值"
                                      validate={(value: string) => {
                                        // TODO: error 无效
                                        let error;
                                        if (
                                          value &&
                                          (value.length === 0 ||
                                            value.length > 1024)
                                        ) {
                                          error = "长度必须大于 0 且小于 1024";
                                        }
                                        return error;
                                      }}
                                    />
                                    <FormErrorMessage>
                                      {errors.attributes &&
                                        // @ts-ignore
                                        errors.attributes[index] &&
                                        // @ts-ignore
                                        errors.attributes[index].value}
                                    </FormErrorMessage>
                                  </div>

                                  <DeleteIcon
                                    color={"red.400"}
                                    _hover={{ color: "red.600" }}
                                    onClick={() => remove(index)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </FieldArray>
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

const NFTList = dynamic(() => Promise.resolve(NFTListTab), {
  ssr: false,
});

// NFT 列表
function NFTListTab() {
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
            <InternalNFTList type="owner" />
          </TabPanel>
          <TabPanel>
            <InternalNFTList type="all" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

// NFT 列表
function InternalNFTList({ type }: { type: "owner" | "all" }) {
  const { address } = useAccount();
  const { data, error, isLoading, mutate } = useSWR<INoahNFT[]>(
    type === "all" ? "/api/nft" : address ? `/api/nft/?owner=${address}` : null
  );

  useEffect(() => {
    eventBus.on(events.NFT_CREATED, mutate);
    return () => {
      eventBus.off(events.NFT_CREATED, mutate);
    };
  }, [mutate]);

  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Spinner />}
      {error && <div>加载失败</div>}
      <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {data &&
          data.map(
            (
              {
                id,
                name,
                description,
                image,
                externalUri,
                tokenId,
                owner,
                createdAt,
              }: INoahNFT,
              idx: number
            ) => {
              return (
                <NFT
                  key={id}
                  imageUri={image}
                  name={name}
                  description={description}
                  external_uri={externalUri}
                  createdAt={createdAt}
                  tokenId={tokenId}
                  owner={owner}
                />
              );
            }
          )}
      </div>
    </div>
  );
}

function NFT({
  imageUri = "https://via.placeholder.com/150",
  name,
  description,
  external_uri,
  createdAt,
  id,
  tokenId,
  owner,
}: {
  imageUri: string;
  name: string;
  description: string;
  external_uri: string;
  createdAt: Date;
  id?: string;
  tokenId?: number | null;
  owner?: string | null;
}) {
  const { onCopy } = useClipboard(owner || "");
  const toast = useToast();

  if (!imageUri) {
    return (
      <Card>
        <Spinner />
      </Card>
    );
  }
  return (
    <Card className="flex flex-col items-center p-4">
      <Image src={imageUri} alt={name} width="200" height={"200"} />
      <div>
        <div>名称：{name}</div>
        <div>描述：{description}</div>
        <div>
          外部链接：
          <a
            href={external_uri}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400"
          >
            {external_uri}
          </a>
        </div>
        {/* <div>属性：{JSON.stringify(item.attributes)}</div> */}
        <div>创建时间：{dayjs(createdAt).format("YYYY-MM-DD")}</div>
        {tokenId && owner ? (
          <>
            <div>TokenId: {tokenId}</div>
            <div className="flex items-center justify-between gap-2">
              <div>
                拥有者:
                {`${owner.substring(0, 5)}...${owner.substring(
                  owner.length - 4,
                  owner.length
                )}`}
              </div>
              <CopyIcon
                className="cursor-pointer"
                onClick={() => {
                  onCopy();
                  toast({
                    title: "复制成功",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
              />
            </div>
          </>
        ) : (
          <div>尚未铸造</div>
        )}
      </div>
    </Card>
  );
}

function UploadImage({ onUpload }: { onUpload: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
        const file = acceptedFiles[0];
        try {
          await check(file);
        } catch (e) {
          toast({
            title: "图片比例必须是 1:1",
            status: "error",
          });
          setIsLoading(false);
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
          })
          .then((res) => {
            onUpload(res.data);
          })
          .finally(() => {
            setIsLoading(false);
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
        style={{
          pointerEvents: isLoading ? "none" : "auto",
        }}
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
            !isLoading ? "bg-gray-50" : "bg-gray-400"
          } flex justify-between items-center py-2 px-4`}
        >
          <Image
            src={URL.createObjectURL(file)}
            alt={file.name}
            width="100"
            height={"100"}
          />
          {!isLoading ? <OkIcon className="fill-green-600" /> : <LoadingIcon />}
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
