import prisma from "@/db";
import { country, matchPath } from "@/lib/utils";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Password from "@/components/Password";
import { DataTable } from "@/components/DataTable";

const LangPage = async ({ params }) => {
	if (!matchPath(params.lang)) return notFound();

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

	let products = await prisma.product.findMany({
		include: {
			productTitle: {
				where: {
					lang: params.lang,
				},
			},
			brand: true,
		},
	});
	const preparedProducts = products
		.filter((product) => product.productTitle.length !== 0)
		.map((prod) => {
			const { variantId, sku, ean, brand } = prod;
			return {
				variantId,
				sku,
				ean,
				brand: brand?.name,
				name: prod.productTitle[0].name,
				lang: prod.productTitle[0].lang,
				price: {
					newPrice: prod.productTitle[0].newPrice,
					oldPrice: prod.productTitle[0].oldPrice,
					priceDifference: prod.productTitle[0].priceDifference,
				},
			};
		});

	const productWithPriceDifference = preparedProducts.filter(
		(product) =>
			product.price.priceDifference > 0 || (product.price.priceDifference < 0 && true)
	);
	const productWithoutPriceDifference = preparedProducts.filter(
		(product) => product.price.priceDifference === 0 && true
	);

	// Get all the brands for the filter
	const brands = await prisma.brand.findMany({
		select: {
			name: true,
		},
	});

	return (
		<main className="p-10">
			<h1 className="text-3xl uppercase font-bold">{country(params.lang)}</h1>
			<DataTable
				data={[...productWithPriceDifference, ...productWithoutPriceDifference]}
				brands={brands}
				lang={params.lang}
			/>
		</main>
	);
};

export default LangPage;
