import _ from "lodash";
import classNames from "classnames";
// import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
// import { Montserrat_Alternates } from "@next/font/google";
import Image from "next/image";

import { Country } from "../interfaces/country";
import countryStyle from "../styles/country.module.css";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// const font = Montserrat_Alternates({
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
// });

export async function getStaticProps() {
  const res = await fetch("https://restcountries.com/v3.1/all");
  const countriesData: Country[] = await res.json();

  return {
    props: {
      countriesData,
    },
  };
}

export default function CountriesPage({
  countriesData,
}: {
  countriesData: Country[];
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [displayCountries, setDisplayCountries] = useState<Country[]>([]);
  const [savedCountries, setSavedCountries] = useState<Country[]>([]);

  /**
   * * Initial Data Load with React Query
   */
  // const { data, error } = useQuery<Country[]>({
  //   queryKey: ["countries"],
  //   queryFn: () =>
  //     fetch("https://restcountries.com/v3.1/all").then((res) => res.json()),
  // });
  // useEffect(() => {
  //   if (data) {
  //     setCountries(data);
  //     setSavedCountries(data);
  //   }
  // }, [data]);

  /**
   * * Initial Data Load with Get Static Props
   */
  useEffect(() => {
    if (countriesData) {
      setCountries(countriesData);
      setSavedCountries(countriesData);
    }
  }, [countriesData]);

  /**
   * * Pagination
   */
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, _setCurrentPageSize] = useState(25);

  useEffect(() => {
    if (countries) {
      setDisplayCountries(countries.slice(0, currentPageSize));
    }
  }, [countries, currentPageSize]);

  useEffect(() => {
    const fetchData = () => {
      const start = (currentPage - 1) * currentPageSize;
      const end = start + currentPageSize;
      setDisplayCountries((countries as Country[]).slice(start, end));
    };

    if (countries) {
      fetchData();
    }
  }, [currentPage, countries, currentPageSize]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(countries?.length / currentPageSize)),
    [countries, currentPageSize]
  );
  const isFirstPage = useMemo(() => currentPage === 1, [currentPage]);
  const isLastPage = useMemo(
    () => currentPage === pageCount,
    [currentPage, pageCount]
  );

  const next = () => {
    setCurrentPage(currentPage + 1);
  };
  const prev = () => {
    setCurrentPage(currentPage - 1);
  };

  /**
   * * Search
   */
  const [searchCriteria, setSearchCriteria] = useState("");
  useEffect(() => {
    if (searchCriteria) {
      setCountries(
        savedCountries.filter((country) =>
          country.name.official
            .toLowerCase()
            .includes(searchCriteria.toLowerCase())
        )
      );
    } else {
      setCountries(savedCountries);
    }

    setCurrentPage(1);
    setOrderNameBy(undefined);
  }, [searchCriteria, savedCountries]);

  /**
   * * Order By
   */
  enum OrderBy {
    ASC = "ASC",
    DESC = "DESC",
  }
  const [orderNameBy, setOrderNameBy] = useState<OrderBy>();

  const orderCountryNameBy = (order: OrderBy) => {
    setOrderNameBy(order);

    if (order === OrderBy.ASC) {
      setCountries(_.orderBy(countries, ["name.official"], "asc"));
    } else if (order === OrderBy.DESC) {
      setCountries(_.orderBy(countries, ["name.official"], "desc"));
    }
  };

  const reset = () => {
    setCountries(savedCountries);
    setOrderNameBy(undefined);
    setSearchCriteria("");
  };

  /**
   * * Dialog
   */

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<Country>();

  const viewCountryDetails = (country: Country) => {
    setCurrentCountry(country);
    setIsDialogOpen(true);
  };

  return (
    <main className={classNames("container mx-auto sm:px-12")}>
      <header>
        <div className="px-4">
          <h1 className="text-4xl font-bold mt-10 inline-block">
            Countries Catalog
          </h1>
          <div className="relative mt-8">
            <div>
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                id="default-search"
                type="search"
                className="block p-4 pl-10 w-full rounded-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Country Name"
                value={searchCriteria}
                onChange={(e) => setSearchCriteria(e.target.value)}
              />
              {/* Due to SSG there will be no error handling here */}
              {/* <div className="text-red-400 mt-2.5 absolute">
                {(error as any)?.["message"]}
              </div> */}
            </div>
          </div>

          <div className="mt-12">Sort by name</div>
          <div className="flex">
            <div className="flex gap-x-2 flex-wrap">
              <button
                className={classNames(
                  countryStyle.buttonAlt,
                  "button-alt border-2 border-sky-700 hover:text-white",
                  {
                    "bg-sky-700 text-white": orderNameBy === OrderBy.ASC,
                  }
                )}
                onClick={() => orderCountryNameBy(OrderBy.ASC)}
              >
                Ascending
              </button>
              <button
                className={classNames(
                  countryStyle.buttonAlt,
                  "button-alt border-2 border-sky-700 hover:text-white",
                  {
                    "bg-sky-700 text-white": orderNameBy === OrderBy.DESC,
                  }
                )}
                onClick={() => orderCountryNameBy(OrderBy.DESC)}
              >
                Descending
              </button>
              <button className={countryStyle.button} onClick={() => reset()}>
                Reset
              </button>
            </div>

            <div className="hidden ml-auto md:flex gap-x-2">
              <button
                disabled={isFirstPage}
                className={classNames(countryStyle.button, {
                  ["!cursor-not-allowed !bg-gray-500 hover:!bg-gray-500"]:
                    isFirstPage,
                })}
                onClick={() => prev()}
              >
                Previous
              </button>
              <button
                disabled={isLastPage}
                className={classNames(countryStyle.button, {
                  ["!cursor-not-allowed !bg-gray-500 hover:!bg-gray-500"]:
                    isLastPage,
                })}
                onClick={() => next()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Countries Catalog Display Wrapper */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-6 my-4 md:mb-12">
        {displayCountries?.map((country, index) => (
          <div className="rounded-xl" key={index}>
            <div
              className="aspect-[1.5] p-4 cursor-pointer"
              onClick={() => viewCountryDetails(country)}
            >
              <Image
                src={country.flags.png}
                alt={country.name.official}
                width={1000}
                height={1000}
                className="w-full h-full"
              />
            </div>
            <div className="p-4">
              <div className="font-bold truncate">{country.name.official}</div>
              <div>{country.cca2}</div>
              <div>{country.cca3}</div>
              <button
                className={classNames(countryStyle.button, "w-full")}
                onClick={() => viewCountryDetails(country)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Pagination */}
      <div className="flex gap-x-2 justify-end mb-12 md:hidden px-4">
        <button
          disabled={isFirstPage}
          className={classNames(countryStyle.button, {
            ["!cursor-not-allowed !bg-gray-500 hover:!bg-gray-500"]:
              isFirstPage,
          })}
          onClick={() => prev()}
        >
          Previous
        </button>
        <button
          disabled={isLastPage}
          className={classNames(countryStyle.button, {
            ["!cursor-not-allowed !bg-gray-500 hover:!bg-gray-500"]: isLastPage,
          })}
          onClick={() => next()}
        >
          Next
        </button>
      </div>

      <Transition appear show={isDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className={classNames("relative z-10")}
          onClose={() => setIsDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="aspect-[1.5]">
                    <Image
                      src={(currentCountry as Country)?.flags.png}
                      alt={(currentCountry as Country)?.name.official}
                      width={1000}
                      height={1000}
                      className="w-full h-full"
                    />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 mt-4"
                  >
                    {currentCountry?.name.official}
                  </Dialog.Title>
                  <div className="mt-2">
                    <div>
                      <span className="font-medium">CCA2:&nbsp;</span>
                      {currentCountry?.cca2}
                    </div>
                    <div>
                      <span className="font-medium">CCA3:&nbsp;</span>
                      {currentCountry?.cca3}
                    </div>
                    <div>
                      <span className="font-medium">
                        Zho Translation:&nbsp;
                      </span>
                      {currentCountry?.name.nativeName.zho
                        ? currentCountry?.name.nativeName.zho.official
                        : currentCountry?.translations.zho.official}
                    </div>
                    <div>
                      <span className="font-medium">
                        Alternative Spellings:&nbsp;
                      </span>
                      {currentCountry?.altSpellings.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium">IDD Root:&nbsp;</span>
                      {currentCountry?.idd.root}
                    </div>
                    <div>
                      <span className="font-medium">IDD Suffixes:&nbsp;</span>
                      {currentCountry?.idd.suffixes.join(", ")}
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className={classNames(countryStyle.button, "w-full")}
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </main>
  );
}
