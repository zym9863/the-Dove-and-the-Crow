<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Feather, Waves } from 'lucide-svelte';

	export let type: 'dove' | 'sea';
	export let isVisible = false;
	export let letterTitle = '';

	const dispatch = createEventDispatcher();

	let animationContainer: HTMLDivElement;
	let showAnimation = false;
	let animationPhase = 0; // 0: 准备, 1: 动画中, 2: 完成

	$: if (isVisible) {
		startCeremony();
	}

	function startCeremony() {
		showAnimation = true;
		animationPhase = 1;
		
		// 动画完成后的回调
		setTimeout(() => {
			animationPhase = 2;
			setTimeout(() => {
				dispatch('complete');
			}, 1000);
		}, type === 'dove' ? 3000 : 2000);
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && animationPhase === 2) {
			dispatch('close');
		}
	}
</script>

{#if isVisible}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && animationPhase === 2 && dispatch('close')}
	>
		<!-- 背景 -->
		<div class="absolute inset-0 bg-gradient-to-br {type === 'dove' ? 'from-blue-900/80 via-blue-800/60 to-blue-600/40' : 'from-slate-900/80 via-slate-800/60 to-blue-900/40'} backdrop-blur-sm"></div>
		
		<!-- 动画容器 -->
		<div bind:this={animationContainer} class="relative w-full h-full overflow-hidden">
			{#if type === 'dove'}
				<!-- 放飞白鸽动画 -->
				<div class="absolute inset-0 flex items-center justify-center">
					<!-- 信笺 -->
					<div class="absolute {animationPhase >= 1 ? 'animate-fade-in' : 'opacity-0'} transition-opacity duration-1000">
						<div class="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-2xl max-w-md mx-auto transform {animationPhase >= 1 ? 'scale-100' : 'scale-95'} transition-transform duration-1000">
							<h3 class="text-xl font-serif text-crow-800 mb-4 text-center">{letterTitle}</h3>
							<p class="text-crow-600 text-center mb-6">即将被白鸽带走...</p>
						</div>
					</div>

					<!-- 白鸽 -->
					<div class="absolute {animationPhase >= 1 ? 'animate-dove-fly' : 'opacity-0'} transition-opacity duration-500">
						<Feather class="w-16 h-16 text-white drop-shadow-lg" />
					</div>

					<!-- 羽毛飘落效果 -->
					{#if animationPhase >= 1}
						{#each Array(8) as _, i}
							<div 
								class="absolute animate-pulse"
								style="
									left: {50 + (Math.random() - 0.5) * 60}%;
									top: {30 + (Math.random() - 0.5) * 40}%;
									animation-delay: {i * 0.3}s;
									animation-duration: {2 + Math.random() * 2}s;
								"
							>
								<Feather class="w-4 h-4 text-white/60 animate-spin" style="animation-duration: {3 + Math.random() * 2}s;" />
							</div>
						{/each}
					{/if}

					<!-- 完成提示 -->
					{#if animationPhase === 2}
						<div class="absolute inset-0 flex items-center justify-center animate-fade-in">
							<div class="bg-white/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl text-center">
								<Feather class="w-12 h-12 text-amber-600 mx-auto mb-4" />
								<h3 class="text-2xl font-serif text-crow-800 mb-2">白鸽已飞走</h3>
								<p class="text-crow-600 mb-4">信笺已被永远封存</p>
								<p class="text-sm text-crow-500">点击任意处关闭</p>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- 沉入深海动画 -->
				<div class="absolute inset-0 flex items-center justify-center">
					<!-- 海面背景 -->
					<div class="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-blue-900/60"></div>
					
					<!-- 波浪效果 -->
					{#if animationPhase >= 1}
						{#each Array(5) as _, i}
							<div 
								class="absolute w-full h-2 bg-blue-300/30 animate-pulse"
								style="
									top: {60 + i * 8}%;
									animation-delay: {i * 0.2}s;
									animation-duration: {2 + Math.random()}s;
								"
							></div>
						{/each}
					{/if}

					<!-- 信笺 -->
					<div class="absolute {animationPhase >= 1 ? 'animate-sink-deep' : 'opacity-0'} transition-opacity duration-500">
						<div class="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-2xl max-w-md mx-auto">
							<h3 class="text-xl font-serif text-crow-800 mb-4 text-center">{letterTitle}</h3>
							<p class="text-crow-600 text-center mb-6">即将沉入深海...</p>
						</div>
					</div>

					<!-- 气泡效果 -->
					{#if animationPhase >= 1}
						{#each Array(12) as _, i}
							<div 
								class="absolute w-2 h-2 bg-blue-200/60 rounded-full animate-bounce"
								style="
									left: {40 + (Math.random() - 0.5) * 40}%;
									top: {70 + Math.random() * 20}%;
									animation-delay: {i * 0.2}s;
									animation-duration: {1 + Math.random()}s;
								"
							></div>
						{/each}
					{/if}

					<!-- 完成提示 -->
					{#if animationPhase === 2}
						<div class="absolute inset-0 flex items-center justify-center animate-fade-in">
							<div class="bg-white/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl text-center">
								<Waves class="w-12 h-12 text-blue-600 mx-auto mb-4" />
								<h3 class="text-2xl font-serif text-crow-800 mb-2">已沉入深海</h3>
								<p class="text-crow-600 mb-4">信笺已彻底消失</p>
								<p class="text-sm text-crow-500">点击任意处关闭</p>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes dove-fly {
		0% {
			transform: translateX(0) translateY(0) scale(1);
			opacity: 1;
		}
		30% {
			transform: translateX(100px) translateY(-50px) scale(0.9);
			opacity: 0.9;
		}
		60% {
			transform: translateX(250px) translateY(-120px) scale(0.7);
			opacity: 0.7;
		}
		100% {
			transform: translateX(400px) translateY(-200px) scale(0.3);
			opacity: 0;
		}
	}

	@keyframes sink-deep {
		0% {
			transform: translateY(0) rotate(0deg);
			opacity: 1;
		}
		30% {
			transform: translateY(50px) rotate(5deg);
			opacity: 0.8;
		}
		60% {
			transform: translateY(150px) rotate(12deg);
			opacity: 0.5;
		}
		100% {
			transform: translateY(300px) rotate(20deg);
			opacity: 0;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-dove-fly {
		animation: dove-fly 3s ease-in-out forwards;
	}

	.animate-sink-deep {
		animation: sink-deep 2s ease-in forwards;
	}

	.animate-fade-in {
		animation: fade-in 0.5s ease-out forwards;
	}
</style>
