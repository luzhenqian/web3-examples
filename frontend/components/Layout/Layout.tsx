import Link from "next/link";
import { useRouter } from "next/router";
import examples from "../../examples.json";
import { Icon } from "../Icon";
import Profile from "../Profile";
import Vivus from "vivus";

function Layout({
  children,
  useWallet = false,
}: {
  children: React.ReactNode;
  useWallet?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="flex h-screen">
      <nav className="w-[300px] p-4 ">
        <ul className="flex flex-col gap-6">
          {examples.map(({ name, description, url, technologyStack, icon }) => (
            <Link key={name} href={url}>
              <li
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 hover:text-black flex items-center gap-2 ${
                  router.route === url
                    ? "bg-gray-200 font-medium shadow-md"
                    : "text-gray-500"
                } `}
                onMouseEnter={() => {
                  new Vivus(icon, {
                    duration: 80,
                    type: "sync",
                    start: "autostart",
                    dashGap: 20,
                    forceRender: false,
                    pathTimingFunction: Vivus.EASE_OUT,
                    animTimingFunction: Vivus.EASE_OUT,
                  });
                }}
              >
                <Icon name={icon} size={24} min={24} id={icon} />
                <span className="flex-1">{name}</span>
              </li>
            </Link>
          ))}
        </ul>
      </nav>
      <div className="flex-1 min-h-full bg-gray-100 shadow-lg rounded-l-[4rem]">
        {useWallet && (
          <div className="flex justify-end p-4 border-b bg-slate-50 rounded-tl-[4rem]">
            <Profile />
          </div>
        )}
        <div className="p-4"> {children}</div>
      </div>
    </div>
  );
}

export { Layout };
