import { Html } from "@react-email/html";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { Row } from "@react-email/row";
import { Column } from "@react-email/column";
import { format } from "date-fns";
import { country, currencyMapping } from "@/lib/utils";

const EmailTemplate = (data, lang) => {
	return (
		<Html>
			<Text>
				Price Changes for {country(lang)} {format(new Date(), "dd-MM-yyyy")}
			</Text>
			<Section>
				<Row style={{ borderBottom: "1px solid black" }}>
					<Column
						style={{
							padding: "3px 6px",
							color: "black",
							textAlign: "left",
							width: "10%",
							fontWeight: "700",
						}}
					>
						ID
					</Column>
					<Column
						style={{
							padding: "3px 6px",
							color: "black",
							textAlign: "left",
							width: "10%",
							fontWeight: "700",
						}}
					>
						SKU
					</Column>
					<Column
						style={{
							padding: "3px 6px",
							color: "black",
							textAlign: "left",
							width: "10%",
							fontWeight: "700",
						}}
					>
						EAN
					</Column>
					<Column
						style={{
							padding: "3px 6px",
							color: "black",
							textAlign: "left",
							width: "50%",
							fontWeight: "700",
						}}
					>
						TITLE
					</Column>
					<Column
						style={{
							padding: "3px 6px",
							color: "black",
							textAlign: "right",
							width: "10%",
							fontWeight: "700",
						}}
					>
						NEW PRICE
					</Column>
				</Row>
				{data.map((item) => {
					return (
						<Row style={{ borderBottom: "1px solid black" }} key={item.ean}>
							<Column
								style={{
									padding: "3px 6px",
									color: "black",
									textAlign: "left",
									width: "10%",
									textTransform: "uppercase",
								}}
							>
								{item.variantId}
							</Column>
							<Column
								style={{
									padding: "3px 6px",
									color: "black",
									textAlign: "left",
									width: "10%",
									textTransform: "uppercase",
								}}
							>
								{item.sku}
							</Column>
							<Column
								style={{
									padding: "3px 6px",
									color: "black",
									textAlign: "left",
									width: "10%",
									textTransform: "uppercase",
								}}
							>
								{item.ean}
							</Column>
							<Column
								style={{
									padding: "3px 6px",
									color: "black",
									textAlign: "left",
									width: "50%",
									textTransform: "uppercase",
								}}
							>
								{item.title}
							</Column>
							<Column
								style={{
									padding: "3px 6px",
									color: "black",
									textAlign: "right",
									width: "10%",
								}}
							>
								{new Intl.NumberFormat(currencyMapping(lang).locale, {
									style: "currency",
									currency: currencyMapping(lang).currency,
								}).format(parseFloat(item.newPrice))}
							</Column>
						</Row>
					);
				})}
			</Section>
		</Html>
	);
};

export default EmailTemplate;
