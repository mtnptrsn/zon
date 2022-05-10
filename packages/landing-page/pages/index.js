import Layout from "../components/layout";
import Head from "next/head";
import cn from "classnames";

export default function Index() {
  return (
    <>
      <Layout>
        <Head>
          <title>Zon</title>
        </Head>

        <div className={cn("h-screen", "flex", "flex-col", "items-center")}>
          <div
            className={cn(
              "py-8",
              "lg:py-16",
              "flex",
              "items-center",
              "flex-col"
            )}
          >
            <h1 className={cn("text-4xl", "md:text-6xl", "mb-1", "md:mb-2")}>
              Zon
            </h1>
            <p className={cn("text-gray-600", "text-lg")}>
              Working out can be fun.
            </p>
          </div>

          <iframe
            className={cn("flex-1", "w-[100%]", "max-w-[1500px]")}
            src="https://www.youtube.com/embed/YSiYewXvlzU"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>

          <div
            className={cn(
              "flex",
              "flex-col",
              "items-center",
              "py-8",
              "lg:py-16"
            )}
          >
            <p className={cn("text-lg", "text-gray-600")}>
              Zon is currently in closed beta.
            </p>
            <a href="https://forms.gle/BFfc5drjhvU4vLpD9" target="_blank">
              <button
                className={cn(
                  "bg-indigo-600",
                  "text-white",
                  // "text-lg",
                  "px-5",
                  "py-2",
                  "rounded",
                  "mt-3"
                )}
              >
                Sign Me Up
              </button>
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
}
