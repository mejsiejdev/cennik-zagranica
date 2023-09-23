import prisma from "@/db";
import { country, matchPath } from "@/lib/utils";
import { main } from "prisma/preinstall";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Password from "@/components/Password";
import { DataTable } from "@/components/TableTest";

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
		})
		.sort((a, b) => {
			const aPriceDiff = parseFloat(a.price.newPrice) - parseFloat(a.price.oldPrice);
			const bPriceDiff = parseFloat(b.price.newPrice) - parseFloat(b.price.oldPrice);
			if (aPriceDiff !== 0 || bPriceDiff !== 0) return 1;
			return 0;
		});
	// console.log(preparedProducts);

	return (
		<main className="p-12">
			<h1 className="text-3xl uppercase font-bold">{country(params.lang)}</h1>
			<DataTable data={preparedProducts} lang={params.lang} />
		</main>
	);
};

export default LangPage;
