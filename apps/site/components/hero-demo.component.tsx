'use client';

import { CodeGloss } from '@codegloss/react';
import {
	HERO_ANNOTATIONS,
	HERO_ARC_STYLE,
	HERO_CODE,
	HERO_CONNECTIONS,
} from './hero-demo.data';
import type { HeroDemoProps } from './hero-demo.types';

const LINES = HERO_CODE.split('\n');

export function HeroDemo({
	highlightedHtml,
	highlightBackground,
	highlightColor,
}: Readonly<HeroDemoProps>) {
	return (
		<div className="hero-compare">
			<div className="hero-compare-panel">
				<div className="hero-compare-label">Before</div>
				<div className="hero-plain">
					<div className="hero-plain-toolbar">
						<span className="hero-plain-dots">
							<span
								className="hero-plain-dot"
								data-color="red"
							/>
							<span
								className="hero-plain-dot"
								data-color="yellow"
							/>
							<span
								className="hero-plain-dot"
								data-color="green"
							/>
						</span>
						<span className="hero-plain-filename">fibonacci.js</span>
					</div>
					<pre className="hero-plain-code">
						{LINES.map((line, i) => (
							<div
								key={line + '-' + i}
								className="hero-plain-line"
							>
								<span className="hero-plain-num">{i + 1}</span>
								<span>{line}</span>
							</div>
						))}
					</pre>
				</div>
			</div>
			<div className="hero-compare-panel">
				<div className="hero-compare-label">After</div>
				<CodeGloss
					code={HERO_CODE}
					lang="js"
					filename="fibonacci.js"
					annotations={HERO_ANNOTATIONS}
					connections={HERO_CONNECTIONS}
					arcs={HERO_ARC_STYLE}
					highlightedHtml={highlightedHtml}
					highlightBackground={highlightBackground}
					highlightColor={highlightColor}
				/>
			</div>
		</div>
	);
}
