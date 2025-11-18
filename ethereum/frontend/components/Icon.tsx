import { IconBaseProps } from "react-icons";
import { TbWallet, TbLoaderQuarter } from "react-icons/tb";
import {
  GiPerspectiveDiceSixFacesRandom,
  GiToken,
  GiCardJackHearts,
} from "react-icons/gi";
import { BiCool } from "react-icons/bi";
import { FaTelegramPlane, FaFaucet } from "react-icons/fa";

function Icon({ name, ...otherProps }: { name: string } & IconBaseProps) {
  if (name === "TbWallet") {
    return <TbWallet {...otherProps} />;
  }
  if (name === "GiPerspectiveDiceSixFacesRandom") {
    return <GiPerspectiveDiceSixFacesRandom {...otherProps} />;
  }
  if (name === "BiCool") {
    return <BiCool {...otherProps} />;
  }
  if (name === "GiToken") {
    return <GiToken {...otherProps} />;
  }
  if (name === "TbLoaderQuarter") {
    return <TbLoaderQuarter {...otherProps} />;
  }
  if (name === "FaTelegramPlane") {
    return <FaTelegramPlane {...otherProps} />;
  }
  if (name === "FaFaucet") {
    return <FaFaucet {...otherProps} />;
  }
  if (name === "GiCardJackHearts") {
    return <GiCardJackHearts {...otherProps} />;
  }

  return <TbWallet {...otherProps} />;
}

export { Icon };
