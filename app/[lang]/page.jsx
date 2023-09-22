import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import prisma from "@/db";
import { country, currencyMapping, matchPath } from "@/lib/utils";
import { main } from "prisma/preinstall";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Password from "@/components/Password";
import { DataTable, DataTableDemo } from "@/components/TableTest";

const LangPage = async ({ params }) => {
	const cookieStore = cookies();
	const cookieLang = cookieStore.get("lang")?.value || "";
	const cookieAuth = cookieStore.get("authorized")?.value
		? JSON.parse(cookieStore.get("authorized")?.value)
		: false;

	if (!cookieAuth)
		return (
			<main>
				<Password lang={params.lang} />
			</main>
		);
	if (cookieLang !== params.lang)
		return (
			<main>
				<Password lang={params.lang} />
			</main>
		);
	if (!matchPath(params.lang)) return notFound();

	let products = await prisma.product.findMany({
		include: {
			ProductTitle: {
				where: {
					lang: params.lang,
				},
			},
		},
	});
	const preparedProducts = products
		.filter((product) => product.ProductTitle.length !== 0)
		.map((prod) => {
			const { variantId, sku, ean, brand } = prod;
			return {
				variantId,
				sku,
				ean,
				brand,
				name: prod.ProductTitle[0].name,
				lang: prod.ProductTitle[0].lang,
				price: {
					newPrice: prod.ProductTitle[0].newPrice,
					oldPrice: prod.ProductTitle[0].oldPrice,
				},
			};
		});

	const setPrice = (item) => {
		const { newPrice, oldPrice } = item.ProductTitle;
		const price = new Intl.NumberFormat(currencyMapping(params.lang).locale, {
			style: "currency",
			currency: currencyMapping(params.lang).currency,
		}).format(newPrice);

		if (newPrice > oldPrice)
			return {
				price: price + " ▲",
				style: "text-black bg-green-300 hover:bg-green-400",
			};
		if (newPrice < oldPrice)
			return {
				price: price + " ▼",
				style: "text-black bg-red-300 hover:bg-red-400",
			};
		return { price: price, style: "text-black bg-white pr-[26px]" };
	};
	return (
		<main className="p-12">
			<h1 className="text-3xl uppercase font-bold mb-4">{country(params.lang)}</h1>
			<DataTable data={preparedProducts} lang={params.lang} />
		</main>
	);
};

export default LangPage;
