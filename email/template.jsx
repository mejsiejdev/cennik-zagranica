import { Html } from "@react-email/html";
import { Section } from "@react-email/section";
import { Container } from "@react-email/container";
import { Text } from "@react-email/text";
import { Row } from "@react-email/row";
import { Column } from "@react-email/column";
import { format } from "date-fns";
import { country, currencyMapping } from "@/lib/utils";

const main = {
	backgroundColor: "#ffffff",
};

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	width: "580px",
};

const heading = {
	fontSize: "32px",
	lineHeight: "1.3",
	fontWeight: "700",
	color: "#484848",
};

const paragraph = {
	fontSize: "18px",
	lineHeight: "1.4",
	color: "#484848",
};

const EmailTemplate = (data, lang) => {
	return (
		<Html>
			<Container>
				<Text>
					Price Changes for {country(lang)} {format(new Date(), "dd-MM-yyyy")}
				</Text>
			</Container>
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
						<Row style={{ borderBottom: "1px solid black" }} key={item.id}>
							<Column
								style={{
									padding: "3px 6px",
									color: "black",
									textAlign: "left",
									width: "10%",
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
