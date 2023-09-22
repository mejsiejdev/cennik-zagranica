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
import { DataTableDemo } from "@/components/TableTest";

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
		.map((prod) => ({
			...prod,
			ProductTitle: { ...prod.ProductTitle[0] },
		}));

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
			<DataTableDemo />
			<Table className="border relative text-black">
				<TableHeader>
					<TableRow className="sticky top-[-1px]">
						<TableHead className=" bg-gray-200 text-center">No.</TableHead>
						<TableHead className=" bg-gray-200 text-center">ID</TableHead>
						<TableHead className="bg-gray-200">SKU</TableHead>
						<TableHead className=" bg-gray-200">EAN</TableHead>
						<TableHead className=" bg-gray-200">BRAND</TableHead>
						<TableHead className=" bg-gray-200">TITLE</TableHead>
						<TableHead className="pr-[26px] bg-gray-200 text-right">PRICE</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{preparedProducts.map((product, index) => {
						const { price, style } = setPrice(product);
						return (
							<TableRow className={style} key={product.id}>
								<TableCell className={`text-center`}>{index + 1}</TableCell>
								<TableCell className={`text-center`}>{product.variantId}</TableCell>
								<TableCell>{product.sku.toUpperCase()}</TableCell>
								<TableCell>{product.ean}</TableCell>
								<TableCell>{product.brand}</TableCell>
								<TableCell>{product.ProductTitle.name}</TableCell>
								<TableCell className={`text-right font-medium`}>{price}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</main>
	);
};

export default LangPage;
