import { defineComponent, h, type PropType } from 'vue';
import type {
	Annotation,
	CodeGlossConfig,
	Connection,
} from '../core/code-gloss.types';

export type CodeGlossProps = CodeGlossConfig;

/**
 * Stateless Vue 3 wrapper around the `<code-gloss>` custom element. Renders
 * the WC with a `<script type="application/json">` child containing the
 * serialized config — exactly the same shape the React wrapper produces.
 *
 * Vue's runtime is happy to render arbitrary tag names via `h()`, so this
 * works without any `app.config.compilerOptions.isCustomElement` configuration
 * at the consumer site (that flag is only needed when authoring template
 * syntax that mentions the custom element directly).
 */
export const CodeGloss = defineComponent({
	name: 'CodeGloss',
	props: {
		code: { type: String, required: true },
		lang: { type: String, required: true },
		filename: { type: String, default: undefined },
		runnable: { type: Boolean, default: undefined },
		annotations: {
			type: Array as PropType<Annotation[]>,
			default: undefined,
		},
		connections: {
			type: Array as PropType<Connection[]>,
			default: undefined,
		},
	},
	setup(props) {
		return () => {
			const payload: CodeGlossConfig = {
				code: props.code,
				lang: props.lang,
				filename: props.filename,
				runnable: props.runnable,
				annotations: props.annotations,
				connections: props.connections,
			};
			// Strip undefined keys so the serialized payload matches the React
			// wrapper byte-for-byte for the common case.
			const cleaned = Object.fromEntries(
				Object.entries(payload).filter(([, v]) => v !== undefined),
			);
			const json = JSON.stringify(cleaned);

			return h('code-gloss', null, [
				h('script', {
					type: 'application/json',
					innerHTML: json,
				}),
			]);
		};
	},
});
